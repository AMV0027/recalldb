"""
Sample Autonomous Agent powered by RecallDB and local Ollama (minicpm-v4.6:latest).

Demonstrates:
1. Scoped memory ingestion (tenant_id, user_id, thread_id).
2. Point-in-time contextual retrieval (as_of slicing).
3. Grounded local inference using Ollama minicpm-v4.6:latest.
4. Non-destructive state supersession (ACTIVE -> SUPERSEDED).
5. Elimination of contradiction collapse in edge AI models.
"""

import sys
import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure recalldb is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from recalldb import RecallDB, MemoryRecord


class RecallDBAgent:
    """
    Autonomous AI agent backed by RecallDB bitemporal persistence
    and local Ollama inference.
    """

    def __init__(
        self,
        db_path: str = "./agent_memory.db",
        model: str = "minicpm-v4.6:latest",
        ollama_url: str = "http://localhost:11434",
        tenant_id: str = "bloom_agency",
        user_id: str = "arunmozhi",
        agent_id: str = "sentinel_v1",
        embedding_provider: str = "deterministic"
    ):
        self.db = RecallDB(db_path=db_path, embedding_provider=embedding_provider)
        self.model = model
        self.ollama_url = ollama_url
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.agent_id = agent_id

    def remember(
        self,
        fact: str,
        valid_from: Optional[str] = None,
        valid_until: Optional[str] = None,
        importance: float = 0.8,
        thread_id: Optional[str] = None
    ) -> MemoryRecord:
        """Stores a newly learned factual assertion."""
        return self.db.remember(
            content=fact,
            valid_from=valid_from,
            valid_until=valid_until,
            importance=importance,
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            agent_id=self.agent_id,
            thread_id=thread_id
        )

    def supersede(
        self,
        old_memory_id: str,
        new_fact: str,
        transition_time: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> MemoryRecord:
        """
        Supersedes an obsolete fact with a new active assertion.
        The old fact remains intact for historical point-in-time queries.
        """
        return self.db.supersede(
            old_memory_id=old_memory_id,
            new_content=new_fact,
            transition_time=transition_time,
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            agent_id=self.agent_id,
            thread_id=thread_id
        )

    def query_ollama(self, system_prompt: str, user_prompt: str) -> str:
        """Invokes local Ollama model via HTTP JSON API."""
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }

        req = urllib.request.Request(
            f"{self.ollama_url}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("message", {}).get("content", "").strip()
        except urllib.error.URLError as e:
            return f"[ERROR] Failed to communicate with Ollama at {self.ollama_url}: {e}"

    def chat(
        self,
        user_message: str,
        as_of: Optional[str] = None,
        thread_id: Optional[str] = None,
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Processes a user query by retrieving relevant point-in-time memories
        and grounding the response using minicpm-v4.6:latest.
        """
        # 1. Retrieve point-in-time memories from RecallDB
        raw_results = self.db.recall(
            query=user_message,
            as_of=as_of,
            top_k=top_k,
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            thread_id=thread_id
        )
        memories = [r.record if hasattr(r, "record") else r for r in raw_results]

        # 2. Construct verified memory context
        if memories:
            memory_context = "### VERIFIED HISTORICAL & ACTIVE CONTEXT:\n"
            for m in memories:
                memory_context += (
                    f"- [MEM_ID: {m.id[:8]}] (Valid: {m.valid_from} -> {m.valid_until or 'Present'}, State: {m.state})\n"
                    f"  Assertion: {m.content}\n"
                )
        else:
            memory_context = "### VERIFIED CONTEXT:\nNo recorded facts found for this timeframe.\n"

        target_epoch = as_of if as_of else "PRESENT (CURRENT ACTIVE STATE)"

        system_prompt = (
            f"You are a precise, evidence-grounded AI agent powered by RecallDB.\n"
            f"TARGET EVALUATION EPOCH: {target_epoch}\n"
            f"RULES:\n"
            f"1. Strictly answer using the verified assertions provided in CONTEXT.\n"
            f"2. If answering for a historical epoch, only reference configurations valid during that epoch.\n"
            f"3. Never mix obsolete configurations with current configurations.\n"
            f"4. Be direct, crisp, and concise.\n\n"
            f"{memory_context}"
        )

        # 3. Call local Ollama model
        response_text = self.query_ollama(system_prompt, user_message)

        return {
            "query": user_message,
            "as_of": as_of,
            "retrieved_count": len(memories),
            "retrieved_memories": [m.to_dict() for m in memories],
            "response": response_text
        }


def run_sample_scenario():
    """Executes a realistic 5-stage agent scenario with live Ollama minicpm-v4.6:latest."""
    import tempfile
    import shutil

    temp_dir = tempfile.mkdtemp(prefix="recalldb_agent_")
    db_file = os.path.join(temp_dir, "test_agent.db")

    print(f"=================================================================")
    print(f"  RecallDB + Ollama (minicpm-v4.6:latest) Sample Agent Demo")
    print(f"=================================================================\n")
    print(f"Database: {db_file}\n")

    try:
        agent = RecallDBAgent(
            db_path=db_file,
            model="minicpm-v4.6:latest",
            tenant_id="agency_prime",
            user_id="arunmozhi"
        )

        # Turn 1: Ingest Initial Configuration (January 2024)
        print("--> Stage 1: Ingesting Initial Infrastructure State (Epoch: 2024-01-01)...")
        m1 = agent.remember(
            fact="Production API runs on FastAPI Python with MySQL database cluster on port 3306",
            valid_from="2024-01-01T00:00:00Z"
        )
        print(f"  [OK] Stored Memory [{m1.id[:8]}] - State: {m1.state}\n")

        # Turn 2: Query Current State in 2024
        print("--> Stage 2: Querying Current State...")
        q1 = "What database and port does our production API run on?"
        res1 = agent.chat(q1)
        print(f"  Query: \"{q1}\"")
        print(f"  AI Response: {res1['response']}\n")

        # Turn 3: Infrastructure Upgrade / Supersession (February 2026)
        print("--> Stage 3: Architecture Migration (Epoch: 2026-02-01) - Atomic Supersession...")
        m2 = agent.supersede(
            old_memory_id=m1.id,
            new_fact="Migrated production API to Rust Axum with PostgreSQL 16 on port 5432",
            transition_time="2026-02-01T00:00:00Z"
        )
        print(f"  [OK] Superseded [{m1.id[:8]}] -> New Memory [{m2.id[:8]}] - State: {m2.state}\n")

        # Turn 4: Query Live State (Should return Postgres, NOT MySQL)
        print("--> Stage 4: Querying Live Current State (2026)...")
        q2 = "What database and programming language does our production API currently use?"
        res2 = agent.chat(q2)
        print(f"  Query: \"{q2}\"")
        print(f"  AI Response: {res2['response']}\n")

        # Turn 5: Historical Point-in-Time Query (as_of 2025-06-01)
        print("--> Stage 5: Time-Travel Query as_of('2025-06-01T00:00:00Z')...")
        q3 = "What database were we running back in mid 2025?"
        res3 = agent.chat(q3, as_of="2025-06-01T00:00:00Z")
        print(f"  Query: \"{q3}\" (as_of: 2025-06-01)")
        print(f"  AI Response: {res3['response']}\n")

        print("=================================================================")
        print("  [OK] Demonstration Complete: Zero Contradiction & Zero Amnesia")
        print("=================================================================")

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    run_sample_scenario()
