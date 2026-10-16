"""
White-Box Test Suite for RecallDB:
Focuses on internal algorithms, structural code paths, mathematical scoring invariants,
bitemporal interval algebra, serialization fidelity, FSM state machines, and SQLite triggers.
"""

import unittest
import tempfile
import shutil
import sqlite3
import math
import struct
from pathlib import Path
import sys

app_dir = Path(__file__).resolve().parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

from recalldb.storage.db import Database, embedding_to_blob, blob_to_embedding, retry_on_lock
from recalldb.core.memory import MemoryRecord, MemoryType, MemoryLifecycleState, utc_now_iso
from recalldb.core.lifecycle import MemoryLifecycleManager
from recalldb.retrieval.temporal import TemporalEvaluator, parse_iso
from recalldb.retrieval.hybrid import HybridRetriever
from recalldb.retrieval.lexical import LexicalRetriever
from recalldb.retrieval.semantic import SemanticRetriever
from recalldb.embeddings.mock import DeterministicHashEmbedding


class TestWhiteBox(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.test_dir) / "whitebox.db")
        self.db = Database(self.db_path)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    # -------------------------------------------------------------------------
    # 1. IEEE 754 Vector BLOB Serialization / Deserialization
    # -------------------------------------------------------------------------

    def test_vector_blob_roundtrip_fidelity(self):
        """Verify IEEE-754 32-bit float serialization round-trip fidelity."""
        # 384-dimensional vector (e.g. MiniLM)
        vec_384 = [math.sin(i * 0.1) for i in range(384)]
        blob_384 = embedding_to_blob(vec_384)
        self.assertEqual(len(blob_384), 384 * 4)  # 4 bytes per float32
        recovered_384 = blob_to_embedding(blob_384)
        self.assertEqual(len(recovered_384), 384)
        for orig, rec in zip(vec_384, recovered_384):
            self.assertAlmostEqual(orig, rec, places=5)

        # 1536-dimensional vector (e.g. OpenAI ada-002 / text-embedding-3)
        vec_1536 = [math.cos(i * 0.05) for i in range(1536)]
        blob_1536 = embedding_to_blob(vec_1536)
        self.assertEqual(len(blob_1536), 1536 * 4)
        recovered_1536 = blob_to_embedding(blob_1536)
        self.assertEqual(len(recovered_1536), 1536)

    def test_vector_blob_edge_cases(self):
        """Verify None, empty lists, and boundary values in blob serialization."""
        self.assertIsNone(embedding_to_blob(None))
        self.assertIsNone(blob_to_embedding(None))
        self.assertEqual(embedding_to_blob([]), b"")
        self.assertEqual(blob_to_embedding(b""), [])

        # Extreme values: subnormal, negative, large magnitudes
        special_floats = [-1.0, 0.0, 1.0, -99999.5, 0.000012345]
        blob = embedding_to_blob(special_floats)
        recovered = blob_to_embedding(blob)
        for orig, rec in zip(special_floats, recovered):
            self.assertAlmostEqual(orig, rec, places=5)

    # -------------------------------------------------------------------------
    # 2. Lifecycle State Machine & Supersession Invariants
    # -------------------------------------------------------------------------

    def test_lifecycle_fsm_allowed_transitions(self):
        """Verify deterministic finite state machine transition legality."""
        # Legal transitions from ACTIVE
        self.assertTrue(MemoryLifecycleManager.can_transition(MemoryLifecycleState.ACTIVE, MemoryLifecycleState.SUPERSEDED))
        self.assertTrue(MemoryLifecycleManager.can_transition(MemoryLifecycleState.ACTIVE, MemoryLifecycleState.CONSOLIDATED))
        self.assertTrue(MemoryLifecycleManager.can_transition(MemoryLifecycleState.ACTIVE, MemoryLifecycleState.ARCHIVED))

        # Illegal backward transition (SUPERSEDED -> ACTIVE)
        self.assertFalse(MemoryLifecycleManager.can_transition(MemoryLifecycleState.SUPERSEDED, MemoryLifecycleState.ACTIVE))

        # ARCHIVED is terminal
        self.assertFalse(MemoryLifecycleManager.can_transition(MemoryLifecycleState.ARCHIVED, MemoryLifecycleState.ACTIVE))
        self.assertFalse(MemoryLifecycleManager.can_transition(MemoryLifecycleState.ARCHIVED, MemoryLifecycleState.SUPERSEDED))

    def test_supersession_dag_invariants(self):
        """Verify structural DAG invariants of atomic supersession."""
        rec_old = MemoryRecord(
            content="Initial deployment on AWS ECS",
            valid_from="2025-01-01T00:00:00Z"
        )
        rec_new = MemoryRecord(
            content="Migrated to self-hosted Kubernetes cluster"
        )

        cut_time = "2025-06-01T12:00:00Z"
        updated_old, updated_new = MemoryLifecycleManager.execute_supersession(
            existing=rec_old,
            new_record=rec_new,
            effective_time=cut_time
        )

        # Invariant 1: State transitions
        self.assertEqual(updated_old.lifecycle_state, MemoryLifecycleState.SUPERSEDED)
        self.assertEqual(updated_new.lifecycle_state, MemoryLifecycleState.ACTIVE)

        # Invariant 2: Boundary alignment: old.valid_until == new.valid_from == cut_time
        self.assertEqual(updated_old.valid_until, cut_time)
        self.assertEqual(updated_new.valid_from, cut_time)

        # Invariant 3: Bidirectional pointer linking
        self.assertEqual(updated_old.superseded_by_id, updated_new.id)
        self.assertEqual(updated_new.supersedes_id, updated_old.id)

    # -------------------------------------------------------------------------
    # 3. Bitemporal Interval Algebra (Half-Open Interval [Vs, Ve))
    # -------------------------------------------------------------------------

    def test_bitemporal_half_open_interval_boundaries(self):
        """Verify Allen's Interval Algebra: t in [valid_from, valid_until)."""
        evaluator = TemporalEvaluator()
        rec = MemoryRecord(
            content="Valid in H1 2025",
            valid_from="2025-01-01T00:00:00Z",
            valid_until="2025-06-01T00:00:00Z"
        )

        # Inclusive start boundary: t == valid_from -> VALID
        self.assertTrue(evaluator.is_valid_as_of(rec, as_of="2025-01-01T00:00:00Z"))

        # Strictly inside: t in (valid_from, valid_until) -> VALID
        self.assertTrue(evaluator.is_valid_as_of(rec, as_of="2025-03-15T12:00:00Z"))
        self.assertTrue(evaluator.is_valid_as_of(rec, as_of="2025-05-31T23:59:59Z"))

        # Exclusive end boundary: t == valid_until -> INVALID (retired)
        self.assertFalse(evaluator.is_valid_as_of(rec, as_of="2025-06-01T00:00:00Z"))

        # Before start boundary -> INVALID
        self.assertFalse(evaluator.is_valid_as_of(rec, as_of="2024-12-31T23:59:59Z"))

        # After end boundary -> INVALID
        self.assertFalse(evaluator.is_valid_as_of(rec, as_of="2025-06-02T00:00:00Z"))

    # -------------------------------------------------------------------------
    # 4. FTS5 Virtual Table Triggers Synchronization
    # -------------------------------------------------------------------------

    def test_fts5_triggers_crud_synchronization(self):
        """Verify SQLite triggers keep memories_fts in exact sync across raw SQL operations."""
        conn = self.db.get_connection()
        try:
            # 1. Direct INSERT into memories
            conn.execute("""
            INSERT INTO memories (id, content, memory_type, recorded_at, tenant_id, user_id, agent_id, thread_id)
            VALUES ('wb_1', 'Postgres connection pool tuning with pgBouncer', 'fact', datetime('now'), 't1', 'u1', 'a1', 'th1')
            """)
            conn.commit()

            # Verify presence in memories_fts via MATCH
            row = conn.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH 'pgBouncer'").fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(row["id"], "wb_1")

            # 2. Direct UPDATE on memories
            conn.execute("UPDATE memories SET content = 'Redis cache cluster with Sentinel failover' WHERE id = 'wb_1'")
            conn.commit()

            # Old keyword must NO longer match
            old_row = conn.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH 'pgBouncer'").fetchone()
            self.assertIsNone(old_row)

            # New keyword must match
            new_row = conn.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH 'Sentinel'").fetchone()
            self.assertIsNotNone(new_row)
            self.assertEqual(new_row["id"], "wb_1")

            # 3. Direct DELETE from memories
            conn.execute("DELETE FROM memories WHERE id = 'wb_1'")
            conn.commit()

            del_row = conn.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH 'Sentinel'").fetchone()
            self.assertIsNone(del_row)
        finally:
            conn.close()

    # -------------------------------------------------------------------------
    # 5. SQLite @retry_on_lock Decorator Mechanics
    # -------------------------------------------------------------------------

    def test_retry_on_lock_recovers_after_transient_failure(self):
        """Verify @retry_on_lock recovers when locked operational errors occur."""
        attempts = 0

        @retry_on_lock(max_retries=5, initial_backoff=0.01)
        def mock_locked_transaction():
            nonlocal attempts
            attempts += 1
            if attempts < 3:
                raise sqlite3.OperationalError("database is locked")
            return "transaction_committed"

        result = mock_locked_transaction()
        self.assertEqual(result, "transaction_committed")
        self.assertEqual(attempts, 3)

    def test_retry_on_lock_raises_after_max_retries_exceeded(self):
        """Verify @retry_on_lock raises OperationalError if lock persists beyond limit."""
        attempts = 0

        @retry_on_lock(max_retries=3, initial_backoff=0.01)
        def permanently_locked_transaction():
            nonlocal attempts
            attempts += 1
            raise sqlite3.OperationalError("database is locked")

        with self.assertRaises(sqlite3.OperationalError):
            permanently_locked_transaction()
        self.assertEqual(attempts, 3)

    # -------------------------------------------------------------------------
    # 6. Hybrid Ranking Score Mathematical Invariants
    # -------------------------------------------------------------------------

    def test_hybrid_multi_factor_formula(self):
        """Verify the exact arithmetic evaluation of the multi-factor hybrid scoring function."""
        embedding = DeterministicHashEmbedding()
        lexical = LexicalRetriever(self.db)
        semantic = SemanticRetriever(self.db, embedding)
        temporal = TemporalEvaluator()

        hybrid = HybridRetriever(
            db=self.db,
            lexical=lexical,
            semantic=semantic,
            temporal=temporal,
            alpha_semantic=0.40,
            beta_lexical=0.30,
            gamma_temporal=0.15,
            delta_importance=0.15,
            eta_staleness=0.50
        )

        # Store test record
        rec = MemoryRecord(
            content="React Query provides declarative asynchronous data fetching",
            importance=0.8,
            confidence=1.0,
            recorded_at=utc_now_iso(),
            valid_from=utc_now_iso()
        )
        self.db.insert(rec)

        results = hybrid.search("React Query data fetching", top_k=1, explain=True)
        self.assertEqual(len(results), 1)

        trace = results[0].explanation
        self.assertIsNotNone(trace)

        # Verify mathematical formula:
        # final = alpha*vec + beta*bm25 + gamma*temp + delta*imp - eta*stale
        expected_score = (
            (0.40 * trace.vector_score) +
            (0.30 * trace.bm25_score) +
            (0.15 * trace.temporal_score) +
            (0.15 * trace.importance_weight) -
            (0.50 * trace.staleness_penalty)
        )
        self.assertAlmostEqual(trace.final_score, expected_score, places=4)
        self.assertAlmostEqual(results[0].score, expected_score, places=4)


if __name__ == "__main__":
    unittest.main()
