"""
Deterministic Finite State Machine (FSM) and supersession dynamics for RecallDB memories.
"""

from __future__ import annotations
from typing import Tuple, Optional
from datetime import datetime, timezone
from recalldb.core.memory import MemoryRecord, MemoryLifecycleState, utc_now_iso


class MemoryLifecycleManager:
    """
    Manages deterministic state transitions:
    ACTIVE -> SUPERSEDED (on state update)
    ACTIVE -> CONSOLIDATED (on semantic consolidation)
    ACTIVE / SUPERSEDED / CONSOLIDATED -> ARCHIVED
    """

    ALLOWED_TRANSITIONS = {
        MemoryLifecycleState.ACTIVE: {
            MemoryLifecycleState.SUPERSEDED,
            MemoryLifecycleState.CONSOLIDATED,
            MemoryLifecycleState.ARCHIVED,
        },
        MemoryLifecycleState.SUPERSEDED: {
            MemoryLifecycleState.ARCHIVED,
        },
        MemoryLifecycleState.CONSOLIDATED: {
            MemoryLifecycleState.ARCHIVED,
        },
        MemoryLifecycleState.ARCHIVED: set(),  # Terminal state
    }

    @classmethod
    def can_transition(cls, current: MemoryLifecycleState, target: MemoryLifecycleState) -> bool:
        """Check if transition between lifecycle states is legally allowed."""
        return target in cls.ALLOWED_TRANSITIONS.get(current, set())

    @classmethod
    def execute_supersession(
        cls,
        existing: MemoryRecord,
        new_record: MemoryRecord,
        effective_time: Optional[str] = None
    ) -> Tuple[MemoryRecord, MemoryRecord]:
        """
        Atomically link supersession:
        1. Set existing.superseded_by_id = new_record.id
        2. Set existing.valid_until = effective_time (or new_record.valid_from)
        3. Transition existing state to SUPERSEDED
        4. Set new_record.supersedes_id = existing.id
        """
        cut_time = effective_time or new_record.valid_from or new_record.event_time or utc_now_iso()
        
        # Invalidate old record from cut_time onwards
        existing.valid_until = cut_time
        existing.superseded_by_id = new_record.id
        existing.lifecycle_state = MemoryLifecycleState.SUPERSEDED
        
        # New record starts valid from cut_time
        if not new_record.valid_from:
            new_record.valid_from = cut_time
        new_record.supersedes_id = existing.id
        new_record.lifecycle_state = MemoryLifecycleState.ACTIVE
        
        return existing, new_record
