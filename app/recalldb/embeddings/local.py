"""
Local SentenceTransformer embedding provider with fallback to deterministic hash.
"""

from typing import List, Optional
import numpy as np
from recalldb.embeddings.base import EmbeddingProvider
from recalldb.embeddings.mock import DeterministicHashEmbedding


class LocalSentenceTransformerEmbedding(EmbeddingProvider):
    """
    Loads local HuggingFace / sentence-transformers models (e.g. all-MiniLM-L6-v2).
    Falls back gracefully to DeterministicHashEmbedding if model download fails or offline.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: Optional[str] = None):
        self.model_name = model_name
        self.device = device
        self._model = None
        self._dim = 384
        self._fallback = None

        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(model_name, device=device)
            if hasattr(self._model, "get_embedding_dimension"):
                self._dim = self._model.get_embedding_dimension()
            else:
                self._dim = self._model.get_sentence_embedding_dimension()
        except Exception:
            # Fallback to deterministic hash if offline or model load error
            self._fallback = DeterministicHashEmbedding(dimension=self._dim)

    @property
    def dimension(self) -> int:
        return self._dim

    def embed_text(self, text: str) -> List[float]:
        if self._model is not None:
            emb = self._model.encode(text, normalize_embeddings=True)
            return emb.tolist()
        return self._fallback.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if self._model is not None:
            embs = self._model.encode(texts, normalize_embeddings=True)
            return embs.tolist()
        return self._fallback.embed_batch(texts)
