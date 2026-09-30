"""
Command-line interface (CLI) for RecallDB Bench (`membench`).
"""

import argparse
import sys
import json
from pathlib import Path
from recalldb.bench.datasets.synthetic import SyntheticTemporalDataset
from recalldb.bench.adapters.recalldb_adapter import RecallDBBenchAdapter
from recalldb.bench.runner import BenchmarkRunner


def main():
    parser = argparse.ArgumentParser(
        prog="membench",
        description="RecallDB Bench: Reproducible AI Agent Memory Evaluation Harness"
    )
    subparsers = parser.add_subparsers(dest="command", help="membench commands")

    # Command: datasets
    ds_parser = subparsers.add_parser("datasets", help="List supported benchmark datasets")

    # Command: run
    run_parser = subparsers.add_parser("run", help="Run a benchmark evaluation")
    run_parser.add_argument("--dataset", default="syntemp-50", choices=["syntemp-50"], help="Dataset name")
    run_parser.add_argument("--mode", default="hybrid", choices=["hybrid", "dense_only", "bm25_only", "hybrid_no_temporal"])
    run_parser.add_argument("--no-temporal", action="store_true", help="Disable temporal interval filtering")
    run_parser.add_argument("-k", type=int, default=5, help="Retrieval Top-K")
    run_parser.add_argument("--outdir", default="research/empirical_paper/experimental_data", help="Output directory for receipts")

    # Command: compare
    cmp_parser = subparsers.add_parser("compare", help="Compare two benchmark receipts")
    cmp_parser.add_argument("receipt_a", help="Path to first receipt JSON")
    cmp_parser.add_argument("receipt_b", help="Path to second receipt JSON")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "datasets":
        print("\nSupported RecallDB Bench Datasets:")
        print("  1. syntemp-50       - Synthetic 50-item bitemporal state transition benchmark")
        print("  2. locomo (adapter) - LoCoMo multi-session conversational memory adapter")
        print("  3. longmemeval      - LongMemEval temporal and knowledge update benchmark\n")

    elif args.command == "run":
        ds = SyntheticTemporalDataset()
        use_temp = not args.no_temporal
        adapter = RecallDBBenchAdapter(mode=args.mode, use_temporal=use_temp)
        runner = BenchmarkRunner(dataset=ds, adapter=adapter)
        receipt = runner.run(top_k=args.k, output_dir=args.outdir)

        print("\n================ BENCHMARK RECEIPT ================")
        print(f"System:              {receipt['adapter']}")
        print(f"Dataset:             {receipt['dataset']}")
        print(f"Queries Evaluated:   {receipt['num_queries']}")
        print(f"Latency (p50):       {receipt['latency_p50_ms']} ms")
        print(f"Latency (p95):       {receipt['latency_p95_ms']} ms")
        print("---------------------------------------------------")
        for k, v in receipt["metrics"].items():
            print(f"  {k:<24}: {v}")
        print("---------------------------------------------------")
        print("Failure Attribution:")
        for cat, count in receipt["failure_attribution"].items():
            print(f"  {cat:<24}: {count}")
        print("===================================================\n")

    elif args.command == "compare":
        with open(args.receipt_a, "r", encoding="utf-8") as fa:
            data_a = json.load(fa)
        with open(args.receipt_b, "r", encoding="utf-8") as fb:
            data_b = json.load(fb)

        print("\n================ SYSTEM COMPARISON ================")
        print(f"Metric                   | {data_a['adapter'][:20]:<20} | {data_b['adapter'][:20]:<20}")
        print("-------------------------|----------------------|----------------------")
        for metric in data_a["metrics"].keys():
            val_a = data_a["metrics"].get(metric, 0.0)
            val_b = data_b["metrics"].get(metric, 0.0)
            diff = val_b - val_a
            diff_str = f"({diff:+.4f})" if diff != 0 else ""
            print(f"{metric:<24} | {val_a:<20} | {val_b} {diff_str}")
        print("===================================================\n")


if __name__ == "__main__":
    main()
