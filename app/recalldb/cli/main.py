"""
Command-line interface (CLI) for RecallDB persistent agent memory engine.
Supports machine-readable JSON output and multi-tenant scoping.
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
    rem_parser.add_argument("--user", default="default", help="User ID for multi-tenancy scoping")
    rem_parser.add_argument("--thread", default="default", help="Thread ID for multi-agent scoping")
    rem_parser.add_argument("--tenant", default="default", help="Tenant ID")
    rem_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Command: recall
    rec_parser = subparsers.add_parser("recall", help="Retrieve memories using hybrid search")
    rec_parser.add_argument("query", help="Search query string")
    rec_parser.add_argument("--db", default="memory.db", help="Path to database")
    rec_parser.add_argument("-k", type=int, default=5, help="Number of results to retrieve")
    rec_parser.add_argument("--as-of", help="Point-in-time timestamp (e.g. 2024-06-01)")
    rec_parser.add_argument("--explain", action="store_true", help="Print explainability scoring traces")
    rec_parser.add_argument("--user", help="Filter by User ID")
    rec_parser.add_argument("--thread", help="Filter by Thread ID")
    rec_parser.add_argument("--tenant", help="Filter by Tenant ID")
    rec_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Command: explain
    exp_parser = subparsers.add_parser("explain", help="Audit memory provenance and lineage")
    exp_parser.add_argument("memory_id", help="Memory record ID (e.g. mem_a1b2c3d4)")
    exp_parser.add_argument("--db", default="memory.db", help="Path to database")
    exp_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Command: inspect
    ins_parser = subparsers.add_parser("inspect", help="Inspect memory store summary and count")
    ins_parser.add_argument("--db", default="memory.db", help="Path to database")
    ins_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

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
            user_id=args.user,
            thread_id=args.thread,
            tenant_id=args.tenant,
        )
        if args.json:
            print(json.dumps(record.to_dict(), indent=2))
        else:
            print(f"[RecallDB] Memory stored: {record.id}")
            print(f"Content: {record.content}")
            print(f"Valid From: {record.valid_from} | State: {record.lifecycle_state.value}")

    elif args.command == "recall":
        db = RecallDB(args.db)
        results = db.recall(
            query=args.query,
            k=args.k,
            as_of=args.as_of,
            explain=args.explain,
            user_id=args.user,
            thread_id=args.thread,
            tenant_id=args.tenant,
        )
        if args.json:
            payload = []
            for res in results:
                item = {
                    "record": res.record.to_dict(),
                    "score": res.score,
                }
                if res.explanation:
                    item["explanation"] = res.explanation.__dict__
                payload.append(item)
            print(json.dumps(payload, indent=2))
        else:
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
        trace_str = db.explain(args.memory_id)
        if args.json:
            print(json.dumps({"memory_id": args.memory_id, "trace": trace_str}, indent=2))
        else:
            print(trace_str)

    elif args.command == "inspect":
        db = RecallDB(args.db)
        cnt = db.count()
        recent = db.db.get_recent(limit=5)
        if args.json:
            payload = {
                "total_memories": cnt,
                "recent_memories": [r.to_dict() for r in recent]
            }
            print(json.dumps(payload, indent=2))
        else:
            print(f"[RecallDB] Memory Store: {Path(args.db).resolve()}")
            print(f"Total memories: {cnt}")
            print("\nRecent entries:")
            for r in recent:
                print(f" - [{r.id}] ({r.lifecycle_state.value}): {r.content[:60]}...")


if __name__ == "__main__":
    main()
