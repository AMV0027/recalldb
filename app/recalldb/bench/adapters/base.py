"""
Abstract memory system adapter interface for RecallDB Bench.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from recalldb.bench.datasets.base import MemoryIngestItem


class MemorySystemAdapter(ABC):
    """Abstract interface wrapping any memory system for standardized benchmarking."""

    @abstractmethod
    def name(self) -> str:
        """Return adapter configuration identifier."""
        pass

    @abstractmethod
    def ingest_all(self, items: List[MemoryIngestItem]) -> None:
        """Ingest test memories into the system."""
        pass

    @abstractmethod
    def retrieve(self, query: str, k: int = 5, as_of: Optional[str] = None) -> List[str]:
        """
        Execute retrieval query and return ranked list of retrieved memory content strings.
        """
        pass

    @abstractmethod
    def reset(self) -> None:
        """Purge and reset memory store."""
        pass
