"""
Semantic dense vector retrieval engine for RecallDB.
Features in-memory matrix caching, incremental synchronization,
and SIMD/NumPy vectorized dot-product search.
"""

from typing import List, Tuple, Optional, Dict
import numpy as np
import time
from recalldb.storage.db import Database, blob_to_embedding
from recalldb.embeddings.base import EmbeddingProvider


class SemanticRetriever:
    """
    Executes fast vector similarity search using cached normalized matrices.
    Avoids O(N) disk I/O and BLOB deserialization per query.
    """

    def __init__(self, db: Database, embedding_provider: EmbeddingProvider):
        self.db = db
        self.embedding_provider = embedding_provider
        self._cached_ids: List[str] = []
        self._cached_matrix: Optional[np.ndarray] = None
        self._last_count: int = -1

    def _ensure_index(self) -> None:
        """Check if memory count changed and synchronize in-memory vector cache."""
        current_count = self.db.count()
        if current_count == self._last_count and self._cached_matrix is not None:
            return

        with self.db.get_connection() as conn:
            # Pre-filter: only active or superseded memories (exclude archived)
            sql = "SELECT id, embedding FROM memories WHERE embedding IS NOT NULL AND lifecycle_state != 'archived'"
            cur = conn.execute(sql)
            rows = cur.fetchall()

        ids = []
        vectors = []
        for row in rows:
            emb = blob_to_embedding(row["embedding"])
            if emb is not None:
                ids.append(row["id"])
                vectors.append(emb)

        if vectors:
            matrix = np.array(vectors, dtype=np.float32)
            # Pre-normalize matrix rows for unit-vector dot product
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self._cached_matrix = matrix / norms
            self._cached_ids = ids
        else:
            self._cached_matrix = None
            self._cached_ids = []

        self._last_count = current_count

    def search(
        self,
        query: str,
        top_k: int = 50,
        query_vector: Optional[List[float]] = None
    ) -> List[Tuple[str, float]]:
        """
        Compute cosine similarity between query and all stored memory vectors.
        Returns list of (memory_id, cosine_similarity) tuples, sorted descending.
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

        # Vectorized dot products over pre-normalized cached matrix
        scores = np.dot(self._cached_matrix, q_vec)

        # Retrieve top_k indices efficiently using argpartition if large, or argsort
        k = min(top_k, len(scores))
        if len(scores) > k * 4:
            top_indices = np.argpartition(scores, -k)[-k:]
            top_indices = top_indices[np.argsort(-scores[top_indices])]
        else:
            top_indices = np.argsort(-scores)[:k]

        results = [(self._cached_ids[idx], float(scores[idx])) for idx in top_indices]
        return results
