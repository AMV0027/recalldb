"""
Deterministic, zero-download embedding provider for fast testing and offline environments.
Generates unit-normalized vectors using multi-hash feature mapping.
"""

from typing import List
import hashlib
import math
import numpy as np
from recalldb.embeddings.base import EmbeddingProvider


class DeterministicHashEmbedding(EmbeddingProvider):
    """
    Computes deterministic unit-normalized embeddings via cryptographic hashing.
    Preserves basic lexical and token frequency overlap without requiring external weights.
    """

    def __init__(self, dimension: int = 384):
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    def embed_text(self, text: str) -> List[float]:
        vec = np.zeros(self._dim, dtype=np.float32)
        words = text.lower().split()
        if not words:
            return vec.tolist()

        for word in words:
            # Hash tokens into vector bins with alternating signs
            h1 = int(hashlib.sha256(word.encode("utf-8")).hexdigest()[:8], 16)
            h2 = int(hashlib.md5(word.encode("utf-8")).hexdigest()[:8], 16)
            idx = h1 % self._dim
            sign = 1.0 if (h2 % 2 == 0) else -1.0
            vec[idx] += sign

        # Add character bi-grams for subword similarity
        for i in range(len(text) - 1):
            bigram = text[i:i+2].lower()
            h = int(hashlib.sha1(bigram.encode("utf-8")).hexdigest()[:8], 16)
            idx = h % self._dim
            vec[idx] += 0.3

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]
