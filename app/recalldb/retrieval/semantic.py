"""
Semantic dense vector retrieval engine for RecallDB.
Features in-memory matrix caching, incremental synchronization,
PRAGMA data_version tracking, and SIMD/NumPy vectorized dot-product search.
"""

from typing import List, Tuple, Optional, Dict, Set
import numpy as np
import time
from recalldb.storage.db import Database, blob_to_embedding
from recalldb.embeddings.base import EmbeddingProvider


class SemanticRetriever:
    """
    Executes fast vector similarity search using cached normalized matrices.
    Tracks SQLite PRAGMA data_version to ensure cache is never stale,
    and uses incremental appending to eliminate O(N) full table scan re-indexing.
    """

    def __init__(self, db: Database, embedding_provider: EmbeddingProvider):
        self.db = db
        self.embedding_provider = embedding_provider
        self._cached_ids: List[str] = []
        self._cached_matrix: Optional[np.ndarray] = None
        self._cached_meta: Dict[str, Dict[str, str]] = {}
        self._last_data_version: int = -1

    def _ensure_index(self) -> None:
        """
        Synchronize in-memory vector cache with database.
        Detects any database mutation via PRAGMA data_version.
        """
        current_version = self.db.get_data_version()
        if current_version == self._last_data_version and self._cached_matrix is not None:
            return

        with self.db.get_connection() as conn:
            cur = conn.execute(
                "SELECT id, lifecycle_state, tenant_id, user_id, thread_id FROM memories WHERE embedding IS NOT NULL"
            )
            rows = cur.fetchall()

        current_active_map = {
            r["id"]: {
                "lifecycle_state": r["lifecycle_state"],
                "tenant_id": r["tenant_id"],
                "user_id": r["user_id"],
                "thread_id": r["thread_id"],
            }
            for r in rows if r["lifecycle_state"] != "archived"
        }
        current_valid_ids = set(current_active_map.keys())
        cached_id_set = set(self._cached_ids)

        new_ids = [mid for mid in current_active_map.keys() if mid not in cached_id_set]
        removed_ids = cached_id_set - current_valid_ids

        # Check if any cached record had a state mutation (e.g. active -> superseded)
        state_changed = False
        for mid in self._cached_ids:
            if mid in current_active_map:
                old_state = self._cached_meta.get(mid, {}).get("lifecycle_state")
                new_state = current_active_map[mid]["lifecycle_state"]
                if old_state != new_state:
                    state_changed = True
                    break

        # Fast incremental append: when only new memories are added and no deletions/mutations
        if self._cached_matrix is not None and not removed_ids and not state_changed and new_ids:
            new_vectors = []
            new_valid_ids = []
            with self.db.get_connection() as conn:
                chunk_size = 500
                for i in range(0, len(new_ids), chunk_size):
                    chunk = new_ids[i:i + chunk_size]
                    placeholders = ",".join("?" for _ in chunk)
                    cur = conn.execute(f"SELECT id, embedding FROM memories WHERE id IN ({placeholders})", chunk)
                    for r in cur.fetchall():
                        emb = blob_to_embedding(r["embedding"])
                        if emb is not None:
                            new_vectors.append(emb)
                            new_valid_ids.append(r["id"])

            if new_vectors:
                new_mat = np.array(new_vectors, dtype=np.float32)
                norms = np.linalg.norm(new_mat, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                new_mat_norm = new_mat / norms

                self._cached_matrix = np.vstack([self._cached_matrix, new_mat_norm])
                self._cached_ids.extend(new_valid_ids)
                for mid in new_valid_ids:
                    self._cached_meta[mid] = current_active_map[mid]

            self._last_data_version = current_version
            return

        # Full rebuild on initial startup, deletions, or state mutations
        ids = []
        vectors = []
        meta = {}
        with self.db.get_connection() as conn:
            sql = """
            SELECT id, embedding, lifecycle_state, tenant_id, user_id, thread_id
            FROM memories
            WHERE embedding IS NOT NULL AND lifecycle_state != 'archived'
            """
            cur = conn.execute(sql)
            for row in cur.fetchall():
                emb = blob_to_embedding(row["embedding"])
                if emb is not None:
                    ids.append(row["id"])
                    vectors.append(emb)
                    meta[row["id"]] = {
                        "lifecycle_state": row["lifecycle_state"],
                        "tenant_id": row["tenant_id"],
                        "user_id": row["user_id"],
                        "thread_id": row["thread_id"],
                    }

        if vectors:
            matrix = np.array(vectors, dtype=np.float32)
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self._cached_matrix = matrix / norms
            self._cached_ids = ids
            self._cached_meta = meta
        else:
            self._cached_matrix = None
            self._cached_ids = []
            self._cached_meta = {}

        self._last_data_version = current_version

    def search(
        self,
        query: str,
        top_k: int = 50,
        query_vector: Optional[List[float]] = None,
        allowed_ids: Optional[Set[str]] = None,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> List[Tuple[str, float]]:
        """
        Compute cosine similarity between query and stored memory vectors.
        Supports scope filtering and allowed ID pre-filtering.
        """
        self._ensure_index()

        if self._cached_matrix is None or len(self._cached_ids) == 0:
            return []

        if query_vector is None:
            query_vector = self.embedding_provider.embed_text(query)

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        scores = np.dot(self._cached_matrix, q_vec)

        # Apply scope and allowed_id masks
        filtered_indices = []
        for idx, mid in enumerate(self._cached_ids):
            if allowed_ids is not None and mid not in allowed_ids:
                continue
            meta = self._cached_meta.get(mid, {})
            if tenant_id and meta.get("tenant_id") != tenant_id:
                continue
            if user_id and meta.get("user_id") != user_id:
                continue
            if thread_id and meta.get("thread_id") != thread_id:
                continue
            filtered_indices.append(idx)

        if not filtered_indices:
            return []

        filtered_indices = np.array(filtered_indices)
        filtered_scores = scores[filtered_indices]

        k = min(top_k, len(filtered_scores))
        if len(filtered_scores) > k * 4:
            top_part = np.argpartition(filtered_scores, -k)[-k:]
            top_part = top_part[np.argsort(-filtered_scores[top_part])]
            best_indices = filtered_indices[top_part]
        else:
            sorted_order = np.argsort(-filtered_scores)[:k]
            best_indices = filtered_indices[sorted_order]

        results = [(self._cached_ids[idx], float(scores[idx])) for idx in best_indices]
        return results
