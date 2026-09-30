"""
RecallDB adapter implementation supporting full hybrid and ablation configurations.
"""

from typing import List, Optional, Dict
import tempfile
import os
from recalldb.bench.adapters.base import MemorySystemAdapter
from recalldb.bench.datasets.base import MemoryIngestItem
from recalldb import RecallDB, MemoryRecord


class RecallDBBenchAdapter(MemorySystemAdapter):
    """
    Wraps RecallDB engine for standardized benchmark runs.
    Allows toggling dense-only, lexical-only, hybrid, and temporal modes.
    """

    def __init__(
        self,
        mode: str = "hybrid",  # "hybrid", "dense_only", "bm25_only", "hybrid_no_temporal"
        use_temporal: bool = True,
        db_path: Optional[str] = None
    ):
        self.mode = mode
        self.use_temporal = use_temporal
        self._custom_path = db_path
        self._tmp_file = None
        self.db: Optional[RecallDB] = None
        self._content_to_id: Dict[str, str] = {}
        self._init_engine()

    def _init_engine(self) -> None:
        if self._custom_path:
            target = self._custom_path
        else:
            self._tmp_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
            self._tmp_file.close()
            target = self._tmp_file.name

        # Configure ablation weights
        if self.mode == "dense_only":
            alpha, beta, gamma, delta, eta = 1.0, 0.0, 0.0, 0.0, 0.0
        elif self.mode == "bm25_only":
            alpha, beta, gamma, delta, eta = 0.0, 1.0, 0.0, 0.0, 0.0
        elif self.mode == "hybrid_no_temporal":
            alpha, beta, gamma, delta, eta = 0.5, 0.5, 0.0, 0.0, 0.0
        else:  # Full hybrid
            alpha, beta, gamma, delta, eta = 0.40, 0.30, 0.15, 0.15, 0.50

        self.db = RecallDB(
            db_path=target,
            alpha_semantic=alpha,
            beta_lexical=beta,
            gamma_temporal=gamma if self.use_temporal else 0.0,
            delta_importance=delta,
            eta_staleness=eta if self.use_temporal else 0.0
        )

    def name(self) -> str:
        return f"recalldb_{self.mode}_{'temporal' if self.use_temporal else 'notemp'}"

    def ingest_all(self, items: List[MemoryIngestItem]) -> None:
        for item in items:
            supersedes_id = None
            if item.supersedes_content and item.supersedes_content in self._content_to_id:
                supersedes_id = self._content_to_id[item.supersedes_content]

            record = self.db.remember(
                content=item.content,
                event_time=item.event_time,
                valid_from=item.valid_from,
                valid_until=item.valid_until,
                source=item.source,
                supersedes_id=supersedes_id,
                metadata=item.metadata
            )
            self._content_to_id[item.content] = record.id

    def retrieve(self, query: str, k: int = 5, as_of: Optional[str] = None) -> List[str]:
        target_as_of = as_of if self.use_temporal else None
        results = self.db.recall(
            query=query,
            k=k,
            as_of=target_as_of,
            include_invalid=not self.use_temporal
        )
        return [r.record.content for r in results]

    def reset(self) -> None:
        self._content_to_id.clear()
        if self._tmp_file and os.path.exists(self._tmp_file.name):
            try:
                os.remove(self._tmp_file.name)
            except Exception:
                pass
        self._init_engine()
