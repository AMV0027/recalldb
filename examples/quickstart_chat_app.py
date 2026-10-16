"""
RecallDB Developer Quickstart: Chat, RAG, Trajectories & Memory Inspector
Run: python examples/quickstart_chat_app.py
"""

import sys
from pathlib import Path

# Add app to path for direct execution
app_dir = Path(__file__).resolve().parent.parent / "app"
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

import recalldb


def main():
    print("=" * 60)
    print("RecallDB: Simplified Developer Quickstart")
    print("=" * 60)

    # Remove existing demo DB for clean reproducible run
    demo_db_path = Path("memory_demo.db")
    if demo_db_path.exists():
        try:
            demo_db_path.unlink()
        except Exception:
            pass

    # 1. Connect to local database (creates memory_demo.db if not exists)
    db = recalldb.connect("memory_demo.db", embedding_provider="deterministic")

    # -------------------------------------------------------------
    # 1. MULTI-CHAT CHATBOT
    # -------------------------------------------------------------
    print("\n[1] Storing Multi-Chat Conversations...")
    # Chat Thread 1: Frontend discussion
    db.add_message("thread-1", "user", "We are building our UI with React and Tailwind CSS.", user_id="arun")
    db.add_message("thread-1", "assistant", "Great choice. Tailwind CSS v4 provides fast utility classes.", user_id="arun")

    # Chat Thread 2: Database discussion
    db.add_message("thread-2", "user", "What database should we use for local agent memory?", user_id="arun")
    db.add_message("thread-2", "assistant", "RecallDB provides zero-server bitemporal SQLite memory.", user_id="arun")

    # Fetch messages for Thread 1
    print("\n--- Active Chat View (Thread 1) ---")
    messages = db.get_messages("thread-1")
    for m in messages:
        print(f"[{m['role'].upper()}] {m['content']}")

    # Fetch sidebar chat threads list
    print("\n--- Sidebar Thread List ---")
    threads = db.get_threads(user_id="arun")
    for t in threads:
        print(f"  * Thread '{t['thread_id']}': \"{t['title']}\" ({t['message_count']} msgs)")

    # -------------------------------------------------------------
    # 2. FAST AGENT TRAJECTORIES (embed=False for <1ms logging)
    # -------------------------------------------------------------
    print("\n[2] Logging Agent Tool Trajectory Steps (embed=False)...")
    db.remember("Step 1: Running pytest app/tests/ -v", embed=False, memory_type="trajectory", thread_id="agent-run-42")
    db.remember("Step 2: 25 passed in 0.8s", embed=False, memory_type="trajectory", thread_id="agent-run-42")
    print("[OK] Logged 2 intermediate agent execution steps in <1ms without embedding compute overhead.")

    # -------------------------------------------------------------
    # 3. UNIFIED RAG + CHAT
    # -------------------------------------------------------------
    print("\n[3] Ingesting Document Chunk (Unified RAG)...")
    db.remember(
        "Refund Policy: Subscriptions can be refunded within 14 days of purchase upon written request.",
        memory_type="doc",
        source="docs/billing_policy.md"
    )

    print("Searching database for 'refund policy'...")
    search_results = db.recall("refund policy", filter_types=["document"])
    for r in search_results:
        print(f"  * Retrieved Doc: \"{r.record.content}\" (Score: {r.score:.4f})")

    # -------------------------------------------------------------
    # 4. USER MEMORY INSPECTOR & ANALYTICS UI
    # -------------------------------------------------------------
    print("\n[4] User Memory Inspector Dashboard...")
    # Store a user fact
    db.remember("User is based in Coimbatore, Tamil Nadu, India.", memory_type="fact", user_id="arun")
    db.remember("User prefers TypeScript and strict mode.", memory_type="preference", user_id="arun")

    facts = db.get_facts(user_id="arun", active_only=True)
    print(f"Total active facts known about user 'arun': {len(facts)}")
    for f in facts:
        print(f"  * [{f['type'].upper()}] {f['content']} (Recorded: {f['recorded_at'][:10]})")

    print("\n" + "=" * 60)
    print("Done! All 4 developer primitives executed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()
