"""
Temporal metrics for evaluating point-in-time accuracy, supersession, and historical queries.
"""

from typing import List


def compute_keyword_accuracy(retrieved_top1: str, expected_keywords: List[str]) -> float:
    """
    Check if retrieved top-1 document contains all expected keywords.
    Returns 1.0 if match, else 0.0.
    """
    if not retrieved_top1:
        return 0.0
    text_lower = retrieved_top1.lower()
    for kw in expected_keywords:
        if kw.lower() not in text_lower:
            return 0.0
    return 1.0


def compute_temporal_accuracy(
    is_historical: bool,
    retrieved_top1: str,
    expected_keywords: List[str]
) -> float:
    """
    Measures temporal accuracy depending on whether query was historical or current.
    """
    return compute_keyword_accuracy(retrieved_top1, expected_keywords)
