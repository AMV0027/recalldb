"""
Provenance tracking and explainability engine for RecallDB.
Traces memory lineage DAGs, evidence sources, and confidence scores.
"""

from typing import List, Optional, Dict, Any
from recalldb.storage.db import Database
from recalldb.core.memory import MemoryRecord, ExplanationTrace


class ProvenanceTracker:
    """Reconstructs historical lineage chains and provenance audits."""

    def __init__(self, db: Database):
        self.db = db

    def get_lineage(self, memory_id: str) -> List[MemoryRecord]:
        """
        Reconstruct full supersession chain backwards and forwards from memory_id.
        Returns ordered list from oldest ancestor to newest descendant.
        """
        current = self.db.get(memory_id)
        if not current:
            return []

        # Trace backwards to root
        ancestors = []
        curr_id = current.supersedes_id
        visited = {current.id}
        while curr_id and curr_id not in visited:
            visited.add(curr_id)
            anc = self.db.get(curr_id)
            if not anc:
                break
            ancestors.append(anc)
            curr_id = anc.supersedes_id
        ancestors.reverse()

        # Trace forwards to leaf
        descendants = []
        curr_id = current.superseded_by_id
        while curr_id and curr_id not in visited:
            visited.add(curr_id)
            desc = self.db.get(curr_id)
            if not desc:
                break
            descendants.append(desc)
            curr_id = desc.superseded_by_id

        return ancestors + [current] + descendants

    def explain(self, memory_id: str) -> str:
        """
        Generate a human-readable and machine-verifiable explanation of a memory's
        epistemic status, validity window, source, and lineage.
        """
        record = self.db.get(memory_id)
        if not record:
            return f"Memory ID '{memory_id}' not found."

        lineage = self.get_lineage(memory_id)
        lines = [
            f"=== RecallDB Provenance Audit for [{record.id}] ===",
            f"Content:         {record.content}",
            f"Type:            {record.memory_type.value}",
            f"State:           {record.lifecycle_state.value.upper()}",
            f"Confidence:      {record.confidence:.2f}",
            f"Importance:      {record.importance:.2f}",
            f"Source Evidence: {record.source}",
            f"Event Time:      {record.event_time or 'Unspecified'}",
            f"Valid Window:    [{record.valid_from or 'Start'} -> {record.valid_until or 'Present'}]",
            f"Recorded At:     {record.recorded_at}",
        ]

        if len(lineage) > 1:
            lines.append("\nLineage Evolution Chain:")
            for idx, item in enumerate(lineage):
                mark = "-> [TARGET]" if item.id == record.id else "  "
                lines.append(f"{mark} ({idx+1}) [{item.id}] Valid: {item.valid_from} -> {item.valid_until or 'present'}")
                lines.append(f"       Content: \"{item.content}\" ({item.lifecycle_state.value})")

        return "\n".join(lines)
