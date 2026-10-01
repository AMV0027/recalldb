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
        embedding_provider: Optional[Union[EmbeddingProvider, str]] = None,
        alpha_semantic: float = 0.40,
        beta_lexical: float = 0.30,
        gamma_temporal: float = 0.15,
        delta_importance: float = 0.15,
        eta_staleness: float = 0.50
    ):
        self.db = Database(db_path)
        if isinstance(embedding_provider, str):
            if embedding_provider.lower() in ("deterministic", "mock", "hash"):
                self.embedding = DeterministicHashEmbedding()
            else:
                self.embedding = LocalSentenceTransformerEmbedding()
        else:
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
        tenant_id: str = "default",
        user_id: str = "default",
        agent_id: str = "default",
        thread_id: str = "default",
    ) -> MemoryRecord:
        """
        Ingest a new memory into persistent storage with automated embedding
        and bitemporal indexing.
        """
        if not content or not isinstance(content, str) or not content.strip():
            raise ValueError("Memory content must be a non-empty string.")
        if len(content) > 65536:
            raise ValueError(f"Memory content exceeds maximum limit of 65536 characters (received {len(content)}).")
        if not (0.0 <= confidence <= 1.0):
            raise ValueError(f"Confidence must be between 0.0 and 1.0 (received {confidence}).")
        if not (0.0 <= importance <= 1.0):
            raise ValueError(f"Importance must be between 0.0 and 1.0 (received {importance}).")

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
            tenant_id=tenant_id or "default",
            user_id=user_id or "default",
            agent_id=agent_id or "default",
            thread_id=thread_id or "default",
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
    def remember_batch(self, items: List[Dict[str, Any]]) -> List[MemoryRecord]:
        """
        Ingest a batch of memories in a single atomic transaction.
        Pre-computes embeddings and writes all records in one transaction.
        """
        if not items:
            return []

        contents = [item["content"] for item in items]
        for c in contents:
            if not c or not isinstance(c, str) or not c.strip():
                raise ValueError("All batch items must contain non-empty string content.")

        # Batch embed
        embeddings = self.embedding.embed_batch(contents)

        records = []
        for item, emb in zip(items, embeddings):
            c = item["content"]
            mtype = item.get("memory_type", MemoryType.FACT)
            if isinstance(mtype, str):
                mtype = MemoryType(mtype.lower())

            v_from = item.get("valid_from") or item.get("event_time") or utc_now_iso()
            r = MemoryRecord(
                content=c,
                event_time=item.get("event_time"),
                valid_from=v_from,
                valid_until=item.get("valid_until"),
                memory_type=mtype,
                entities=item.get("entities") or [],
                source=item.get("source", "agent:interaction"),
                confidence=float(item.get("confidence", 1.0)),
                importance=float(item.get("importance", 0.5)),
                supersedes_id=item.get("supersedes_id"),
                metadata=item.get("metadata") or {},
                tenant_id=item.get("tenant_id", "default"),
                user_id=item.get("user_id", "default"),
                agent_id=item.get("agent_id", "default"),
                thread_id=item.get("thread_id", "default"),
                embedding=emb,
            )
            records.append(r)

        return self.db.insert_batch(records)


    def recall(
        self,
        query: str,
        k: int = 5,
        top_k: Optional[int] = None,
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
        Retrieve relevant memories using multi-factor hybrid ranking
        with point-in-time temporal evaluation and multi-tenancy scoping.
        """
        effective_k = top_k if top_k is not None else k
        return self.hybrid.search(
            query=query,
            top_k=effective_k,
            as_of=as_of,
            filter_types=filter_types,
            min_confidence=min_confidence,
            include_invalid=include_invalid,
            explain=explain,
            tenant_id=tenant_id,
            user_id=user_id,
            thread_id=thread_id,
        )

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
        """Alias for recall() with identical signature and hybrid ranking semantics."""
        return self.recall(
            query=query,
            k=top_k,
            as_of=as_of,
            filter_types=filter_types,
            min_confidence=min_confidence,
            include_invalid=include_invalid,
            explain=explain,
            tenant_id=tenant_id,
            user_id=user_id,
            thread_id=thread_id,
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
        if not content or not isinstance(content, str) or not content.strip():
            raise ValueError("Updated memory content must be a non-empty string.")
        if len(content) > 65536:
            raise ValueError(f"Updated memory content exceeds maximum limit of 65536 characters (received {len(content)}).")

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
            tenant_id=existing.tenant_id,
            user_id=existing.user_id,
            agent_id=existing.agent_id,
            thread_id=existing.thread_id,
            embedding=self.embedding.embed_text(content),
        )

        _, updated_new = self.db.supersede(
            existing_id=memory_id,
            new_record=new_record,
            effective_time=new_record.valid_from
        )
        return updated_new

    def supersede(
        self,
        existing_id: Optional[str] = None,
        new_content: Optional[str] = None,
        old_memory_id: Optional[str] = None,
        new_fact: Optional[str] = None,
        event_time: Optional[str] = None,
        effective_time: Optional[str] = None,
        transition_time: Optional[str] = None,
        source: Optional[str] = None,
        **kwargs
    ) -> MemoryRecord:
        """Explicit supersession helper transitioning existing memory to SUPERSEDED."""
        target_id = existing_id or old_memory_id
        if not target_id:
            raise ValueError("Either existing_id or old_memory_id must be provided to supersede.")
        content = new_content or new_fact
        if not content:
            raise ValueError("Either new_content or new_fact must be provided to supersede.")
        t_time = transition_time or effective_time or event_time
        return self.update(
            memory_id=target_id,
            content=content,
            event_time=t_time,
            supersedes=True,
            source=source
        )

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
