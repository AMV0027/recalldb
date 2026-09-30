"""
Core memory model and data structures for RecallDB.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
import json
import uuid


class MemoryType(str, Enum):
    """Semantic category of stored memory."""
    FACT = "fact"
    EVENT = "event"
    PREFERENCE = "preference"
    OBSERVATION = "observation"
    RELATIONSHIP = "relationship"
    EXPERIENCE = "experience"


class MemoryLifecycleState(str, Enum):
    """Lifecycle state machine node for memory validity."""
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    CONSOLIDATED = "consolidated"
    ARCHIVED = "archived"


def utc_now_iso() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


@dataclass
class MemoryRecord:
    """
    Core memory representation supporting bitemporal intervals,
    provenance, and vector embeddings.
    """
    id: str = field(default_factory=lambda: f"mem_{uuid.uuid4().hex[:12]}")
    content: str = ""
    memory_type: MemoryType = MemoryType.FACT
    lifecycle_state: MemoryLifecycleState = MemoryLifecycleState.ACTIVE
    
    # Bitemporal Model
    # Event Time: when the event actually occurred in the real world
    event_time: Optional[str] = None
    # Valid Interval: [valid_from, valid_until)
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    # Transaction / System Time: when the memory was recorded in the database
    recorded_at: str = field(default_factory=utc_now_iso)
    
    # Provenance & Epistemics
    source: str = "agent:interaction"
    confidence: float = 1.0  # [0.0, 1.0]
    importance: float = 0.5  # [0.0, 1.0]
    
    # Lineage / DAG pointers
    supersedes_id: Optional[str] = None
    superseded_by_id: Optional[str] = None
    
    # Structured tags and attributes
    entities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Vector embedding (float32 array)
    embedding: Optional[List[float]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert record to JSON-serializable dictionary."""
        return {
            "id": self.id,
            "content": self.content,
            "memory_type": self.memory_type.value if isinstance(self.memory_type, MemoryType) else str(self.memory_type),
            "lifecycle_state": self.lifecycle_state.value if isinstance(self.lifecycle_state, MemoryLifecycleState) else str(self.lifecycle_state),
            "event_time": self.event_time,
            "valid_from": self.valid_from,
            "valid_until": self.valid_until,
            "recorded_at": self.recorded_at,
            "source": self.source,
            "confidence": self.confidence,
            "importance": self.importance,
            "supersedes_id": self.supersedes_id,
            "superseded_by_id": self.superseded_by_id,
            "entities": self.entities,
            "metadata": self.metadata,
        }

    @classmethod
    def from_row(cls, row: Dict[str, Any]) -> MemoryRecord:
        """Hydrate record from SQLite query row dictionary."""
        entities = row.get("entities")
        if isinstance(entities, str):
            try:
                entities = json.loads(entities)
            except Exception:
                entities = [e.strip() for e in entities.split(",") if e.strip()]
        elif entities is None:
            entities = []

        metadata = row.get("metadata")
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except Exception:
                metadata = {}
        elif metadata is None:
            metadata = {}

        return cls(
            id=row["id"],
            content=row["content"],
            memory_type=MemoryType(row.get("memory_type", "fact")),
            lifecycle_state=MemoryLifecycleState(row.get("lifecycle_state", "active")),
            event_time=row.get("event_time"),
            valid_from=row.get("valid_from"),
            valid_until=row.get("valid_until"),
            recorded_at=row.get("recorded_at", utc_now_iso()),
            source=row.get("source", "agent:interaction"),
            confidence=float(row.get("confidence", 1.0)),
            importance=float(row.get("importance", 0.5)),
            supersedes_id=row.get("supersedes_id"),
            superseded_by_id=row.get("superseded_by_id"),
            entities=entities,
            metadata=metadata,
        )


@dataclass
class ExplanationTrace:
    """Detailed attribution trace explaining why a memory was retrieved."""
    memory_id: str
    content: str
    final_score: float
    vector_score: float
    bm25_score: float
    temporal_score: float
    staleness_penalty: float
    importance_weight: float
    is_temporally_valid: bool
    as_of: Optional[str]
    source: str
    confidence: float
    decision_rationale: str


@dataclass
class RetrievalResult:
    """Wrapper holding a retrieved memory record and its scoring telemetry."""
    record: MemoryRecord
    score: float
    explanation: Optional[ExplanationTrace] = None
