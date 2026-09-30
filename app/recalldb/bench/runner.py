"""
Standardized benchmark execution runner and receipt generator for RecallDB Bench.
"""

from typing import Dict, Any, List
import time
import json
import statistics
from pathlib import Path
from recalldb.bench.datasets.base import BaseBenchmarkDataset
from recalldb.bench.adapters.base import MemorySystemAdapter
from recalldb.bench.metrics.retrieval import compute_recall_at_k, compute_mrr, compute_ndcg_at_k
from recalldb.bench.metrics.temporal import compute_keyword_accuracy
from recalldb.bench.metrics.attribution import attribute_failure, FailureCategory


class BenchmarkRunner:
    """Executes controlled benchmark experiments and compiles reproducibility receipts."""

    def __init__(self, dataset: BaseBenchmarkDataset, adapter: MemorySystemAdapter):
        self.dataset = dataset
        self.adapter = adapter

    def run(self, top_k: int = 5, output_dir: Optional[str] = None) -> Dict[str, Any]:
        print(f"\n[RecallDB Bench] Initializing run for Adapter: '{self.adapter.name()}' on Dataset: '{self.dataset.name()}'")
        
        # 1. Reset and Ingest
        self.adapter.reset()
        ingest_start = time.perf_counter()
        ingest_items = self.dataset.get_ingest_data()
        self.adapter.ingest_all(ingest_items)
        ingest_time_ms = (time.perf_counter() - ingest_start) * 1000.0

        queries = self.dataset.get_queries()
        latencies_ms = []
        
        recalls_at_1 = []
        recalls_at_3 = []
        recalls_at_5 = []
        mrrs = []
        ndcgs = []
        
        hist_accuracies = []
        curr_accuracies = []
        all_accuracies = []
        
        attribution_counts = {
            FailureCategory.SUCCESS.value: 0,
            FailureCategory.RETRIEVAL_FAILURE.value: 0,
            FailureCategory.TEMPORAL_FAILURE.value: 0,
            FailureCategory.READER_FAILURE.value: 0,
        }

        query_traces = []

        for q in queries:
            t0 = time.perf_counter()
            retrieved = self.adapter.retrieve(q.query, k=top_k, as_of=q.query_time)
            lat_ms = (time.perf_counter() - t0) * 1000.0
            latencies_ms.append(lat_ms)

            top1 = retrieved[0] if retrieved else ""

            # Retrieval Metrics
            r1 = compute_recall_at_k(retrieved, q.ground_truth_memory_content, k=1)
            r3 = compute_recall_at_k(retrieved, q.ground_truth_memory_content, k=3)
            r5 = compute_recall_at_k(retrieved, q.ground_truth_memory_content, k=5)
            mrr = compute_mrr(retrieved, q.ground_truth_memory_content)
            ndcg = compute_ndcg_at_k(retrieved, q.ground_truth_memory_content, k=5)

            recalls_at_1.append(r1)
            recalls_at_3.append(r3)
            recalls_at_5.append(r5)
            mrrs.append(mrr)
            ndcgs.append(ndcg)

            # Accuracy
            acc = compute_keyword_accuracy(top1, q.expected_answer_keywords)
            all_accuracies.append(acc)
            if q.is_historical:
                hist_accuracies.append(acc)
            else:
                curr_accuracies.append(acc)

            # Failure Attribution
            fail_type = attribute_failure(
                retrieved=retrieved,
                ground_truth=q.ground_truth_memory_content,
                expected_keywords=q.expected_answer_keywords,
                top_1_text=top1
            )
            attribution_counts[fail_type.value] += 1

            query_traces.append({
                "id": q.id,
                "query": q.query,
                "as_of": q.query_time,
                "latency_ms": round(lat_ms, 2),
                "top1_match": bool(acc),
                "failure_type": fail_type.value,
                "top_retrieved": top1[:120] if top1 else None
            })

        latencies_ms.sort()
        p50 = statistics.median(latencies_ms) if latencies_ms else 0.0
        p95 = latencies_ms[int(len(latencies_ms) * 0.95)] if latencies_ms else 0.0

        receipt = {
            "adapter": self.adapter.name(),
            "dataset": self.dataset.name(),
            "num_ingested": len(ingest_items),
            "num_queries": len(queries),
            "ingest_time_total_ms": round(ingest_time_ms, 2),
            "latency_p50_ms": round(p50, 2),
            "latency_p95_ms": round(p95, 2),
            "metrics": {
                "recall_at_1": round(statistics.mean(recalls_at_1), 4),
                "recall_at_3": round(statistics.mean(recalls_at_3), 4),
                "recall_at_5": round(statistics.mean(recalls_at_5), 4),
                "mrr": round(statistics.mean(mrrs), 4),
                "ndcg_at_5": round(statistics.mean(ndcgs), 4),
                "top1_accuracy": round(statistics.mean(all_accuracies), 4),
                "historical_accuracy": round(statistics.mean(hist_accuracies), 4) if hist_accuracies else 0.0,
                "current_update_accuracy": round(statistics.mean(curr_accuracies), 4) if curr_accuracies else 0.0,
            },
            "failure_attribution": attribution_counts,
            "traces": query_traces
        }

        if output_dir:
            out_path = Path(output_dir)
            out_path.mkdir(parents=True, exist_ok=True)
            receipt_file = out_path / f"receipt_{self.adapter.name()}.json"
            with open(receipt_file, "w", encoding="utf-8") as f:
                json.dump(receipt, f, indent=2)
            print(f"[RecallDB Bench] Saved execution receipt to: {receipt_file}")

        return receipt
