"""
Multi-factor hybrid ranking engine for RecallDB.
Fuses semantic embeddings, FTS5 BM25, bitemporal state, importance,
and generates explainability traces.
"""

from typing import List, Optional, Dict, Set
from recalldb.storage.db import Database
from recalldb.retrieval.lexical import LexicalRetriever
from recalldb.retrieval.semantic import SemanticRetriever
from recalldb.retrieval.temporal import TemporalEvaluator
from recalldb.core.memory import MemoryRecord, RetrievalResult, ExplanationTrace


class HybridRetriever:
    """
    Unified candidate generation, bitemporal filtering, and multi-factor ranking.
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
        explain: bool = False
    ) -> List[RetrievalResult]:
        """
        Execute full hybrid retrieval pipeline:
        1. Query dense semantic vectors
        2. Query lexical BM25
        3. Merge candidate pool
        4. Apply bitemporal filtering
        5. Score candidates with multi-factor formula
        6. Generate explanation trace
        """
        # Step 1 & 2: Candidates
        semantic_matches = dict(self.semantic.search(query, top_k=top_k * 3))
        lexical_matches = dict(self.lexical.search(query, top_k=top_k * 3))

        candidate_ids: Set[str] = set(semantic_matches.keys()).union(set(lexical_matches.keys()))

        # If both empty, fallback to recent memories
        if not candidate_ids:
            all_recs = self.db.all_memories()
            candidate_ids = {r.id for r in all_recs[-top_k*2:]}

        scored_results: List[RetrievalResult] = []

        for mem_id in candidate_ids:
            record = self.db.get(mem_id)
            if not record:
                continue

            # Confidence check
            if record.confidence < min_confidence:
                continue

            # Type filter
            if filter_types and record.memory_type.value not in filter_types:
                continue

            # Temporal validity check
            is_valid = self.temporal.is_valid_as_of(record, as_of)
            if not include_invalid and not is_valid:
                # Discard temporally invalid records (e.g. superseded past states)
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
                    rationale_parts.append(f"high semantic alignment ({vec_score:.2f})")
                if bm25_score > 0.3:
                    rationale_parts.append(f"exact lexical match ({bm25_score:.2f})")
                if is_valid:
                    rationale_parts.append("active in temporal window")
                else:
                    rationale_parts.append("temporally invalidated/superseded")

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
                    decision_rationale=", ".join(rationale_parts) or "baseline candidate"
                )

            scored_results.append(RetrievalResult(
                record=record,
                score=final_score,
                explanation=trace
            ))

        # Sort descending by final score
        scored_results.sort(key=lambda x: x.score, reverse=True)
        return scored_results[:top_k]
