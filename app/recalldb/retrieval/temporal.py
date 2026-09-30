"""
Bitemporal filtering, point-in-time slicing, and recency scoring for RecallDB.
"""

from typing import Optional, Dict
from datetime import datetime, timezone
import math
from recalldb.core.memory import MemoryRecord, MemoryLifecycleState, utc_now_iso


def parse_iso(ts_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO timestamp string or simple date string into UTC datetime."""
    if not ts_str:
        return None
    # Support basic YYYY-MM-DD format
    if len(ts_str) == 10 and "-" in ts_str:
        ts_str = f"{ts_str}T00:00:00Z"
    
    clean_str = ts_str.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(clean_str).astimezone(timezone.utc)
    except Exception:
        return None


class TemporalEvaluator:
    """Evaluates point-in-time validity, event proximity, and staleness."""

    def __init__(self, half_life_days: float = 365.0):
        self.half_life_days = half_life_days

    def is_valid_as_of(self, record: MemoryRecord, as_of: Optional[str]) -> bool:
        """
        Evaluate formal bitemporal predicate:
        as_of(t) satisfies: valid_from <= t < valid_until
        """
        if as_of is None:
            # Querying current live reality
            if record.lifecycle_state == MemoryLifecycleState.SUPERSEDED:
                return False
            if record.valid_until:
                now_dt = datetime.now(timezone.utc)
                until_dt = parse_iso(record.valid_until)
                if until_dt and now_dt >= until_dt:
                    return False
            return True

        query_dt = parse_iso(as_of)
        if query_dt is None:
            return True

        # Check valid_from bound
        v_from_dt = parse_iso(record.valid_from or record.event_time or record.recorded_at)
        if v_from_dt and query_dt < v_from_dt:
            return False

        # Check valid_until bound
        v_until_dt = parse_iso(record.valid_until)
        if v_until_dt and query_dt >= v_until_dt:
            return False

        return True

    def compute_temporal_score(
        self,
        record: MemoryRecord,
        as_of: Optional[str]
    ) -> float:
        """
        Computes temporal relevance score in [0.0, 1.0].
        Scores higher for events closer to the query point in time.
        """
        target_dt = parse_iso(as_of) if as_of else datetime.now(timezone.utc)
        record_dt = parse_iso(record.event_time or record.valid_from or record.recorded_at)

        if not target_dt or not record_dt:
            return 0.5  # Neutral default

        delta_seconds = abs((target_dt - record_dt).total_seconds())
        delta_days = delta_seconds / 86400.0

        # Exponential decay: e^(-lambda * days)
        decay_constant = math.log(2.0) / max(1.0, self.half_life_days)
        score = math.exp(-decay_constant * delta_days)
        return float(min(1.0, max(0.0, score)))

    def compute_staleness_penalty(
        self,
        record: MemoryRecord,
        as_of: Optional[str]
    ) -> float:
        """
        Penalizes records that are expired or superseded relative to the query time.
        Returns penalty in [0.0, 1.0].
        """
        is_valid = self.is_valid_as_of(record, as_of)
        if not is_valid:
            return 0.8  # Heavy penalty for invalid temporal window
        return 0.0
