# RecallDB

> **An open-source research and infrastructure platform for persistent, temporal agent memory and reproducible memory evaluation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Status: Research Prototype](https://img.shields.io/badge/status-research--prototype-orange.svg)]()

---

## ⚡ Executive Overview

Modern AI agents maintain context within single conversation sessions, but long-horizon state across weeks, months, or years breaks down. Standard semantic retrieval (Vector DBs) suffers from:
1. **Temporal Blindness:** Inability to distinguish outdated assertions ("I write Python") from current state ("I write Rust").
2. **Contradiction Collapse:** Vector similarity surfaces contradictory records with equal scores.
3. **Missing Provenance:** No traceable lineage from memory back to primary conversation/tool events.
4. **Conflated Evaluation:** Retrieval failures are obscured by LLM reasoning hallucinations.

**RecallDB** solves this by unifying two core systems into a single embedded substrate:
* **RecallDB Engine:** A zero-server, local-first, single-file (`memory.db`) persistent memory engine with bitemporal indexing (valid time vs. event time vs. recorded time), FTS5 BM25 lexical search, dense vector embeddings, and multi-factor hybrid retrieval with explainable attribution traces.
* **RecallDB Bench:** A scientific evaluation harness that evaluates memory systems across retrieval accuracy, temporal correctness, answer quality, and agent task utility on standardized benchmarks (Synthetic Temporal, LongMemEval, LoCoMo).

---

## 🏗 Architecture

```text
                         RECALLDB
                            │
             ┌──────────────┴──────────────┐
             │                             │
      RECALLDB ENGINE               RECALLDB BENCH
             │                             │
       ┌─────┴─────┐               ┌──────┴──────┐
       │           │               │             │
    Storage     Retrieval       Datasets       Metrics
       │           │               │             │
       │      ┌────┴─────┐        │        ┌────┴─────┐
       │      │          │        │        │          │
    SQLite  Vector     BM25     Synthetic  Retrieval  Cost
    (WAL)     │          │      LongMem    Temporal   Latency
       │      └────┬─────┘      LoCoMo     Answer     Tokens
       │           │
       │      Bitemporal
       │      Ranking
       ▼
   memory.db
```

---

## 🚀 Quickstart

### Python API

```python
from recalldb import RecallDB

# 1. Initialize local persistent memory
memory = RecallDB("agent_memory.db")

# 2. Store facts and state with provenance and temporal bounds
memory.remember(
    "User develops backend systems in Python",
    event_time="2024-05-10",
    source="conversation:104"
)

# 3. Later state update (supersedes previous knowledge)
memory.remember(
    "User transitioned backend development to Rust",
    event_time="2026-01-15",
    source="conversation:412"
)

# 4. Point-in-time historical recall
past = memory.recall("What backend language does the user use?", as_of="2024-12-01")
print(past[0].content)  # -> "User develops backend systems in Python"

# 5. Current state recall
current = memory.recall("What backend language does the user use?", as_of="2026-06-01")
print(current[0].content)  # -> "User transitioned backend development to Rust"

# 6. Explain retrieval reasoning
explanation = memory.explain(current[0].id)
print(explanation)
```

---

## 📦 Project Structure

* `docs/` — Architecture design, formal temporal specifications, and API guides.
* `research/` — Literature matrices, academic survey review paper, and empirical research paper with benchmark receipts.
* `app/recalldb/` — Embedded core storage, bitemporal ranker, lexical/vector search, and CLI.
* `app/bench/` — Reproducible benchmarking harness, metric suite, and dataset adapters.
* `landing-page/` — Interactive web demonstration and visual memory timeline inspector.

---

## 📜 License

MIT License. Developed for open-source AI agent research.
