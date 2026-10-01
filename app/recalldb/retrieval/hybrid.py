"""
Hybrid retrieval engine combining dense vectors, BM25, and bitemporal point-in-time scoring.
Enforces SQL temporal pre-filtering to eliminate recall truncation under historical churn.
"""

from typing import List, Optional, Dict, Set
from dataclasses import dataclass
from recalldb.core.memory import MemoryRecord, ExplanationTrace, RetrievalResult
from recalldb.storage.db import Database
from recalldb.retrieval.lexical import LexicalRetriever
from recalldb.retrieval.semantic import SemanticRetriever
from recalldb.retrieval.temporal import TemporalEvaluator


class HybridRetriever:
    """
    Fuses dense vector similarity, BM25 lexical precision, and bitemporal interval filters.
    """

    def __init__(
        self,
        db: Database,
        lexical: LexicalRetriever,
        semantic: SemanticRetriever,
        temporal: TemporalEvaluator,
        alpha_semantic: float = 0.40,
        beta_lexical: float = 0.30,
        gamma_temporal: float = 0.15,
        delta_importance: float = 0.15,
        eta_staleness: float = 0.50
    ):
        self.db = db
        self.lexical = lexical
        self.semantic = semantic
        self.temporal = temporal

        self.alpha = alpha_semantic
        self.beta = beta_lexical
        self.gamma = gamma_temporal
        self.delta = delta_importance
        self.eta = eta_staleness

    def search(
        self,
        query: str,
        top_k: int = 10,
        as_of: Optional[str] = None,
        filter_types: Optional[List[str]] = None,
        min_confidence: float = 0.0,
        include_invalid: bool = False,
        explain: bool = False,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> List[RetrievalResult]:
        """
        Execute full hybrid retrieval pipeline:
        1. Validate temporal format & execute SQL temporal pre-filtering (eliminates truncation)
        2. Query dense semantic vectors within valid scope
        3. Query lexical BM25 within valid scope
        4. Merge and score candidate pool with multi-factor formula
        """
        # Validate as_of format early
        if as_of is not None:
            # Raises ValueError if invalid ISO format
            self.temporal.is_valid_as_of(
                MemoryRecord(id="dummy", content="dummy", valid_from="2000-01-01T00:00:00Z"),
                as_of
            )

        # Step 1: Pre-filtering
        allowed_ids: Optional[Set[str]] = None
        if not include_invalid:
            allowed_ids = self.db.get_valid_ids(
                as_of=as_of,
                tenant_id=tenant_id,
                user_id=user_id,
                thread_id=thread_id
            )
            if not allowed_ids:
                return []

        # Candidate limit: dynamically scaled to guarantee high recall
        candidate_k = max(top_k * 5, 50)

        # Step 2: Candidates retrieval with allowed_id and scope pre-filtering
        semantic_matches = dict(self.semantic.search(
            query,
            top_k=candidate_k,
            allowed_ids=allowed_ids,
            tenant_id=tenant_id,
            user_id=user_id,
            thread_id=thread_id
        ))
        lexical_matches = dict(self.lexical.search(
            query,
            top_k=candidate_k,
            allowed_ids=allowed_ids,
            tenant_id=tenant_id,
            user_id=user_id,
            thread_id=thread_id
        ))

        candidate_ids: Set[str] = set(semantic_matches.keys()).union(set(lexical_matches.keys()))

        if not candidate_ids and allowed_ids:
            # Fallback to recent valid memories within scope
            recent_recs = self.db.get_recent(limit=top_k * 2)
            candidate_ids = {r.id for r in recent_recs if r.id in allowed_ids}

        if not candidate_ids:
            return []

        # Step 3: Batch hydrate candidate records
        record_map = self.db.get_many(list(candidate_ids))

        scored_results: List[RetrievalResult] = []

        for mem_id in candidate_ids:
            record = record_map.get(mem_id)
            if not record:
                continue

            # Confidence check
            if record.confidence < min_confidence:
                continue

            # Type filter
            if filter_types and record.memory_type.value not in filter_types:
                continue

            # Double-check temporal validity
            is_valid = self.temporal.is_valid_as_of(record, as_of)
            if not include_invalid and not is_valid:
                continue

            vec_score = semantic_matches.get(mem_id, 0.0)
            bm25_score = lexical_matches.get(mem_id, 0.0)
            temp_score = self.temporal.compute_temporal_score(record, as_of)
            staleness = self.temporal.compute_staleness_penalty(record, as_of)
            importance = record.importance

            # Multi-factor score
            final_score = (
                (self.alpha * vec_score) +
                (self.beta * bm25_score) +
                (self.gamma * temp_score) +
                (self.delta * importance) -
                (self.eta * staleness)
            )

            trace = None
            if explain:
                rationale_parts = []
                if vec_score > 0.4:
                    rationale_parts.append(f"semantic alignment ({vec_score:.2f})")
                if bm25_score > 0.3:
                    rationale_parts.append(f"exact lexical match ({bm25_score:.2f})")
                if is_valid:
                    rationale_parts.append("active in temporal window")
                else:
                    rationale_parts.append("temporally invalidated")

                trace = ExplanationTrace(
                    memory_id=record.id,
                    content=record.content,
                    final_score=final_score,
                    vector_score=vec_score,
                    bm25_score=bm25_score,
                    temporal_score=temp_score,
                    staleness_penalty=staleness,
                    importance_weight=importance,
                    is_temporally_valid=is_valid,
                    as_of=as_of,
                    source=record.source,
                    confidence=record.confidence,
                    decision_rationale=" | ".join(rationale_parts)
                )

            scored_results.append(RetrievalResult(
                record=record,
                score=final_score,
                explanation=trace
            ))

        # Sort descending by score
        scored_results.sort(key=lambda x: x.score, reverse=True)
        return scored_results[:top_k]
