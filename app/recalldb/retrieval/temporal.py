"""
Bitemporal filtering, point-in-time slicing, and recency scoring for RecallDB.
Strictly validates timestamp strings and rejects malformed temporal queries.
"""

from typing import Optional, Dict
from datetime import datetime, timezone
import math
import re
from recalldb.core.memory import MemoryRecord, MemoryLifecycleState, utc_now_iso


def parse_iso(ts_str: Optional[str], strict: bool = False) -> Optional[datetime]:
    """
    Parse ISO timestamp string or date string into UTC datetime.
    If strict=True and parsing fails, raises ValueError.
    """
    if not ts_str:
        return None

    s = ts_str.strip()
    # Support basic YYYY-MM-DD format
    if len(s) == 10 and re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        s = f"{s}T00:00:00Z"
    elif " " in s and "T" not in s:
        s = s.replace(" ", "T")

    clean_str = s.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(clean_str).astimezone(timezone.utc)
    except Exception as e:
        if strict:
            raise ValueError(f"Invalid timestamp format: '{ts_str}'. Expected ISO-8601 (e.g. '2024-05-10' or '2024-05-10T14:30:00Z')") from e
        return None


class TemporalEvaluator:
    """Evaluates point-in-time validity, event proximity, and staleness."""

    def __init__(self, half_life_days: float = 365.0):
        self.half_life_days = half_life_days

    def is_valid_as_of(self, record: MemoryRecord, as_of: Optional[str]) -> bool:
        """
        Evaluate formal bitemporal predicate:
        as_of(t) satisfies: valid_from <= t < valid_until
        Raises ValueError if as_of is provided but contains an invalid format.
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

        # Enforce strict parsing on query as_of
        query_dt = parse_iso(as_of, strict=True)
        if query_dt is None:
            raise ValueError(f"as_of argument cannot be empty if specified: '{as_of}'")

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
        target_dt = parse_iso(as_of, strict=False) if as_of else datetime.now(timezone.utc)
        record_dt = parse_iso(record.event_time or record.valid_from or record.recorded_at, strict=False)

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
        try:
            is_valid = self.is_valid_as_of(record, as_of)
        except ValueError:
            return 1.0

        if not is_valid:
            return 0.8  # Heavy penalty for invalid temporal window
        return 0.0
