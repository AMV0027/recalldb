"""
Command-line interface (CLI) for RecallDB persistent agent memory engine.
"""

import argparse
import sys
import json
from pathlib import Path
from recalldb import RecallDB


def main():
    parser = argparse.ArgumentParser(
        prog="recalldb",
        description="RecallDB: Persistent, Temporal Agent Memory Infrastructure"
    )
    subparsers = parser.add_subparsers(dest="command", help="RecallDB Commands")

    # Command: init
    init_parser = subparsers.add_parser("init", help="Initialize a new RecallDB memory database")
    init_parser.add_argument("db_path", nargs="?", default="memory.db", help="Path to SQLite database file")

    # Command: remember
    rem_parser = subparsers.add_parser("remember", help="Store a memory into the database")
    rem_parser.add_argument("content", help="Memory content statement")
    rem_parser.add_argument("--db", default="memory.db", help="Path to database")
    rem_parser.add_argument("--event-time", help="Event occurrence date (e.g. 2024-05-10)")
    rem_parser.add_argument("--source", default="cli:user", help="Provenance source identifier")
    rem_parser.add_argument("--type", default="fact", choices=["fact", "event", "preference", "observation", "relationship", "experience"])
    rem_parser.add_argument("--importance", type=float, default=0.5, help="Importance weight [0.0 - 1.0]")

    # Command: recall
    rec_parser = subparsers.add_parser("recall", help="Retrieve memories using hybrid search")
    rec_parser.add_argument("query", help="Search query string")
    rec_parser.add_argument("--db", default="memory.db", help="Path to database")
    rec_parser.add_argument("-k", type=int, default=5, help="Number of results to retrieve")
    rec_parser.add_argument("--as-of", help="Point-in-time timestamp (e.g. 2024-06-01)")
    rec_parser.add_argument("--explain", action="store_true", help="Print explainability scoring traces")

    # Command: explain
    exp_parser = subparsers.add_parser("explain", help="Audit memory provenance and lineage")
    exp_parser.add_argument("memory_id", help="Memory record ID (e.g. mem_a1b2c3d4)")
    exp_parser.add_argument("--db", default="memory.db", help="Path to database")

    # Command: inspect
    ins_parser = subparsers.add_parser("inspect", help="Inspect memory store summary and count")
    ins_parser.add_argument("--db", default="memory.db", help="Path to database")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "init":
        db_path = args.db_path
        db = RecallDB(db_path)
        print(f"[RecallDB] Initialized persistent memory store at: {Path(db_path).resolve()}")

    elif args.command == "remember":
        db = RecallDB(args.db)
        record = db.remember(
            content=args.content,
            event_time=args.event_time,
            source=args.source,
            memory_type=args.type,
            importance=args.importance,
        )
        print(f"[RecallDB] Memory stored: {record.id}")
        print(f"Content: {record.content}")
        print(f"Valid From: {record.valid_from} | State: {record.lifecycle_state.value}")

    elif args.command == "recall":
        db = RecallDB(args.db)
        results = db.recall(
            query=args.query,
            k=args.k,
            as_of=args.as_of,
            explain=args.explain
        )
        print(f"\n[RecallDB] Recall Results for query: '{args.query}' (as_of: {args.as_of or 'present'})")
        print(f"Found {len(results)} matches:\n")
        for i, res in enumerate(results, 1):
            r = res.record
            print(f"#{i} [{r.id}] (Score: {res.score:.3f} | {r.memory_type.value})")
            print(f"    Content: {r.content}")
            print(f"    Valid: [{r.valid_from} -> {r.valid_until or 'present'}] | Source: {r.source}")
            if res.explanation:
                e = res.explanation
                print(f"    Telemetry: Vector={e.vector_score:.2f} BM25={e.bm25_score:.2f} Temp={e.temporal_score:.2f} Penalty={e.staleness_penalty:.2f}")
                print(f"    Decision: {e.decision_rationale}")
            print()

    elif args.command == "explain":
        db = RecallDB(args.db)
        print(db.explain(args.memory_id))

    elif args.command == "inspect":
        db = RecallDB(args.db)
        cnt = db.count()
        print(f"[RecallDB] Store: {Path(args.db).resolve()}")
        print(f"Total memories: {cnt}")


if __name__ == "__main__":
    main()
