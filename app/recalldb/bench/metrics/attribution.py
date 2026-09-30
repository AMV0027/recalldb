"""
Tri-Factor Failure Attribution Classifier.
Decouples retrieval failure from temporal invalidation and reader failure.
"""

from enum import Enum
from typing import List


class FailureCategory(str, Enum):
    SUCCESS = "success"
    RETRIEVAL_FAILURE = "retrieval_failure"          # Ground truth missing from retrieved context
    TEMPORAL_FAILURE = "temporal_failure"            # Outdated/superseded memory retrieved instead
    READER_FAILURE = "reader_failure"                # Context present, but model failed


def attribute_failure(
    retrieved: List[str],
    ground_truth: str,
    expected_keywords: List[str],
    top_1_text: str
) -> FailureCategory:
    """
    Classify whether a query failed due to retrieval omission or temporal conflict.
    """
    # 1. Did top-1 match?
    matches_kw = all(kw.lower() in top_1_text.lower() for kw in expected_keywords)
    if matches_kw:
        return FailureCategory.SUCCESS

    # 2. Was ground truth retrieved at all in top-k?
    found_in_top_k = any(ground_truth.strip() in d.strip() or d.strip() in ground_truth.strip() for d in retrieved)
    if not found_in_top_k:
        return FailureCategory.RETRIEVAL_FAILURE

    # 3. Ground truth was in top-k, but top-1 was superseded/outdated
    return FailureCategory.TEMPORAL_FAILURE
