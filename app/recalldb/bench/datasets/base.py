"""
Base dataset schema and interface for RecallDB Bench.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class MemoryIngestItem:
    """A memory fact or event to ingest during benchmark initialization."""
    content: str
    event_time: Optional[str] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    source: str = "benchmark:setup"
    supersedes_content: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BenchmarkExample:
    """A single evaluation query instance with ground truth."""
    id: str
    query: str
    query_time: Optional[str] = None  # as_of point in time
    expected_answer_keywords: List[str] = field(default_factory=list)
    ground_truth_memory_content: str = ""
    is_historical: bool = False
    is_update_query: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseBenchmarkDataset:
    """Abstract benchmark dataset interface."""

    def name(self) -> str:
        raise NotImplementedError

    def get_ingest_data(self) -> List[MemoryIngestItem]:
        """Return the sequence of memories to ingest into the system."""
        raise NotImplementedError

    def get_queries(self) -> List[BenchmarkExample]:
        """Return the test queries to evaluate."""
        raise NotImplementedError
