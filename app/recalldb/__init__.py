"""
RecallDB: Persistent, Temporal Agent Memory Infrastructure.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any, Union
import json
from pathlib import Path

from recalldb.core.memory import (
    MemoryRecord,
    MemoryType,
    MemoryLifecycleState,
    RetrievalResult,
    ExplanationTrace,
    utc_now_iso,
)
from recalldb.storage.db import Database
from recalldb.embeddings.base import EmbeddingProvider
from recalldb.embeddings.local import LocalSentenceTransformerEmbedding
from recalldb.embeddings.mock import DeterministicHashEmbedding
from recalldb.retrieval.lexical import LexicalRetriever
from recalldb.retrieval.semantic import SemanticRetriever
from recalldb.retrieval.temporal import TemporalEvaluator
from recalldb.retrieval.hybrid import HybridRetriever
from recalldb.provenance.tracker import ProvenanceTracker

__version__ = "0.1.0"


class RecallDB:
    """
    Primary developer API for RecallDB persistent agent memory engine.
    Zero-server, embedded, bitemporal, and hybrid-search enabled.
    """

    def __init__(
        self,
        db_path: str = "memory.db",
        embedding_provider: Optional[EmbeddingProvider] = None,
        alpha_semantic: float = 0.40,
        beta_lexical: float = 0.30,
        gamma_temporal: float = 0.15,
        delta_importance: float = 0.15,
        eta_staleness: float = 0.50
    ):
        self.db = Database(db_path)
        self.embedding = embedding_provider or LocalSentenceTransformerEmbedding()
        
        self.lexical = LexicalRetriever(self.db)
        self.semantic = SemanticRetriever(self.db, self.embedding)
        self.temporal = TemporalEvaluator()
        self.hybrid = HybridRetriever(
            db=self.db,
            lexical=self.lexical,
            semantic=self.semantic,
            temporal=self.temporal,
            alpha_semantic=alpha_semantic,
            beta_lexical=beta_lexical,
            gamma_temporal=gamma_temporal,
            delta_importance=delta_importance,
            eta_staleness=eta_staleness,
        )
        self.provenance = ProvenanceTracker(self.db)

    def remember(
        self,
        content: str,
        event_time: Optional[str] = None,
        valid_from: Optional[str] = None,
        valid_until: Optional[str] = None,
        memory_type: Union[MemoryType, str] = MemoryType.FACT,
        entities: Optional[List[str]] = None,
        source: str = "agent:interaction",
        confidence: float = 1.0,
        importance: float = 0.5,
        supersedes_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> MemoryRecord:
        """
        Ingest a new memory into persistent storage with automated embedding
        and bitemporal indexing.
        """
        if isinstance(memory_type, str):
            memory_type = MemoryType(memory_type.lower())

        emb = self.embedding.embed_text(content)
        v_from = valid_from or event_time or utc_now_iso()

        record = MemoryRecord(
            content=content,
            memory_type=memory_type,
            lifecycle_state=MemoryLifecycleState.ACTIVE,
            event_time=event_time,
            valid_from=v_from,
            valid_until=valid_until,
            recorded_at=utc_now_iso(),
            source=source,
            confidence=confidence,
            importance=importance,
            supersedes_id=supersedes_id,
            entities=entities or [],
            metadata=metadata or {},
            embedding=emb,
        )

        if supersedes_id:
            # Atomic supersession linking
            _, updated_record = self.db.supersede(
                existing_id=supersedes_id,
                new_record=record,
                effective_time=v_from
            )
            return updated_record

        return self.db.insert(record)

    def recall(
        self,
        query: str,
        k: int = 5,
        as_of: Optional[str] = None,
        filter_types: Optional[List[str]] = None,
        min_confidence: float = 0.0,
        include_invalid: bool = False,
        explain: bool = False
    ) -> List[RetrievalResult]:
        """
        Retrieve relevant memories using multi-factor hybrid ranking
        with point-in-time temporal evaluation.
        """
        return self.hybrid.search(
            query=query,
            top_k=k,
            as_of=as_of,
            filter_types=filter_types,
            min_confidence=min_confidence,
            include_invalid=include_invalid,
            explain=explain,
        )

    def update(
        self,
        memory_id: str,
        content: str,
        event_time: Optional[str] = None,
        supersedes: bool = True,
        source: Optional[str] = None,
    ) -> MemoryRecord:
        """
        Update knowledge. If supersedes=True, preserves historical audit trail
        by creating a new record and retiring the previous record in-place.
        """
        existing = self.db.get(memory_id)
        if not existing:
            raise ValueError(f"Memory with ID '{memory_id}' not found.")

        if not supersedes:
            existing.content = content
            if event_time:
                existing.event_time = event_time
            if source:
                existing.source = source
            existing.embedding = self.embedding.embed_text(content)
            self.db.update(existing)
            return existing

        # Supersession update
        new_record = MemoryRecord(
            content=content,
            memory_type=existing.memory_type,
            lifecycle_state=MemoryLifecycleState.ACTIVE,
            event_time=event_time or existing.event_time,
            valid_from=event_time or utc_now_iso(),
            source=source or existing.source,
            confidence=existing.confidence,
            importance=existing.importance,
            entities=existing.entities,
            metadata=existing.metadata,
            embedding=self.embedding.embed_text(content),
        )

        _, updated_new = self.db.supersede(
            existing_id=memory_id,
            new_record=new_record,
            effective_time=new_record.valid_from
        )
        return updated_new

    def explain(self, memory_id: str) -> str:
        """Generate provenance and explainability report for a memory."""
        return self.provenance.explain(memory_id)

    def delete(self, memory_id: str) -> bool:
        """Delete a memory record."""
        return self.db.delete(memory_id)

    def count(self) -> int:
        """Return total memory count."""
        return self.db.count()

    def export_json(self, file_path: str) -> None:
        """Export all memories to JSON file."""
        records = [m.to_dict() for m in self.db.all_memories()]
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)

    def import_json(self, file_path: str) -> int:
        """Import memories from JSON file."""
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        count = 0
        for item in data:
            self.remember(
                content=item["content"],
                event_time=item.get("event_time"),
                valid_from=item.get("valid_from"),
                valid_until=item.get("valid_until"),
                memory_type=item.get("memory_type", "fact"),
                entities=item.get("entities"),
                source=item.get("source", "import"),
                confidence=item.get("confidence", 1.0),
                importance=item.get("importance", 0.5),
                metadata=item.get("metadata"),
            )
            count += 1
        return count


__all__ = [
    "RecallDB",
    "MemoryRecord",
    "MemoryType",
    "MemoryLifecycleState",
    "RetrievalResult",
    "ExplanationTrace",
    "DeterministicHashEmbedding",
    "LocalSentenceTransformerEmbedding",
]
