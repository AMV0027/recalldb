"""
Standard retrieval metrics for RecallDB Bench: Recall@K, Precision@K, MRR, and nDCG.
"""

from typing import List
import math


def compute_recall_at_k(retrieved: List[str], ground_truth: str, k: int) -> float:
    """Return 1.0 if ground_truth is within the top-k retrieved items, else 0.0."""
    top_k = retrieved[:k]
    for doc in top_k:
        if ground_truth.strip() in doc.strip() or doc.strip() in ground_truth.strip():
            return 1.0
    return 0.0


def compute_mrr(retrieved: List[str], ground_truth: str) -> float:
    """Compute Mean Reciprocal Rank (1 / rank of first relevant item)."""
    for rank, doc in enumerate(retrieved, start=1):
        if ground_truth.strip() in doc.strip() or doc.strip() in ground_truth.strip():
            return 1.0 / rank
    return 0.0


def compute_ndcg_at_k(retrieved: List[str], ground_truth: str, k: int) -> float:
    """Compute Normalized Discounted Cumulative Gain at K for binary relevance."""
    top_k = retrieved[:k]
    dcg = 0.0
    for rank, doc in enumerate(top_k, start=1):
        if ground_truth.strip() in doc.strip() or doc.strip() in ground_truth.strip():
            dcg += 1.0 / math.log2(rank + 1)
            break
    # Ideal DCG for 1 relevant document is 1 / log2(1 + 1) = 1.0
    idcg = 1.0
    return dcg / idcg
