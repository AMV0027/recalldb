"""
Semantic dense vector retrieval engine for RecallDB.
Computes vectorized cosine similarities using SIMD/NumPy dot products.
"""

from typing import List, Tuple, Optional
import numpy as np
from recalldb.storage.db import Database, blob_to_embedding
from recalldb.embeddings.base import EmbeddingProvider


class SemanticRetriever:
    """Executes dense vector similarity search over embedded memory records."""

    def __init__(self, db: Database, embedding_provider: EmbeddingProvider):
        self.db = db
        self.embedding_provider = embedding_provider

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
        if query_vector is None:
            query_vector = self.embedding_provider.embed_text(query)

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        results = []
        with self.db.get_connection() as conn:
            cur = conn.execute("SELECT id, embedding FROM memories WHERE embedding IS NOT NULL")
            rows = cur.fetchall()
            if not rows:
                return []

            ids = []
            vectors = []
            for row in rows:
                emb = blob_to_embedding(row["embedding"])
                if emb is not None:
                    ids.append(row["id"])
                    vectors.append(emb)

            if not vectors:
                return []

            matrix = np.array(vectors, dtype=np.float32)
            # Normalize matrix rows if needed
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            norm_matrix = matrix / norms

            # Batch dot products
            scores = np.dot(norm_matrix, q_vec)

            # Map to results
            for mem_id, score in zip(ids, scores):
                results.append((mem_id, float(score)))

        # Sort descending by cosine similarity
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
