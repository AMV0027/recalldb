# RecallDB

> **An open-source research and infrastructure platform for persistent, temporal agent memory and reproducible memory evaluation.**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23107756.svg)](https://doi.org/10.5281/zenodo.23107756)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Status: Research Preprint](https://img.shields.io/badge/status-research--preprint-success.svg)]()

📄 **Research Paper:** [Read on Zenodo (DOI: 10.5281/zenodo.23107756)](https://doi.org/10.5281/zenodo.23107756) | [Download IEEE PDF](https://github.com/AMV0027/recalldb/raw/main/research/empirical_paper/recalldb_empirical_ieee.pdf)

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

## 📦 Installation

```bash
# Standard local-first installation (Zero external daemons, pure SQLite WAL)
pip install recalldb

# Optional: with AI provider SDKs
pip install "recalldb[ai]"     # Installs OpenAI & Anthropic SDKs

# Optional: with local PyTorch SentenceTransformers
pip install "recalldb[ml]"     # Local neural embedding models
```

---

## ⚡ The 1-Line AI Superpower

RecallDB gives **any** AI agent or LLM persistent, bitemporal long-term memory with **a single line of code**.

### 1. Zero-Setup Memory Chat with Local Edge Models (Ollama)
```python
import recalldb

# Connect in 1 line
db = recalldb.connect()

# Ingest knowledge
db.remember("Production API runs on Rust Axum with PostgreSQL 16 on port 5432")

# Chat with local Ollama model in 1 line — memories automatically retrieved & grounded!
response = db.chat("What port does our database run on?", provider="ollama", model="minicpm-v4.6:latest")
print(response.content)
# -> "Based on your verified configuration, PostgreSQL runs on port 5432."
```

### 2. Connect to OpenAI, Anthropic, or Any OpenAI-Compatible Provider
```python
# OpenAI GPT-4o
reply = db.chat("What port does our database run on?", provider="openai", model="gpt-4o")

# Anthropic Claude 3.5 Sonnet
reply = db.chat("What port does our database run on?", provider="anthropic", model="claude-3-5-sonnet-20241022")

# Groq / DeepSeek / LocalAI (OpenAI-compatible)
reply = db.chat(
    "What port does our database run on?",
    provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile"
)
```

### 3. Augment Existing Message Arrays for Any Agent Framework
```python
# Seamlessly inject memories into standard OpenAI / Anthropic / LangChain message lists
messages = [
    {"role": "user", "content": "Deploy the backend service"}
]

# 1-liner memory augmentation:
augmented_messages = db.augment_messages(messages, user_id="arunmozhi")
# -> Injects verified bitemporal memories directly into the system prompt!
```

### 4. Expose as Function-Calling Tools to Autonomous Agents
```python
# Export OpenAI/Ollama/Anthropic compatible function tools in 1 line:
tools = db.as_tool()

# When the LLM outputs a tool call, execute it in 1 line:
result = db.execute_tool("recall_memory", {"query": "database configuration"})
```

---

## 🕰️ Bitemporal Time Travel & Zero Contradiction Collapse

Unlike flat vector databases that suffer from temporal blindness and overwrite prior reality, RecallDB preserves an immutable historical audit trail:

```python
# 1. State in 2024
m1 = db.remember("Primary database is MySQL 8.0 on port 3306", valid_from="2024-01-01T00:00:00Z")

# 2. State migration in 2026 (atomic supersession)
m2 = db.supersede(
    old_memory_id=m1.id,
    new_fact="Migrated primary database to PostgreSQL 16 on port 5432",
    transition_time="2026-02-01T00:00:00Z"
)

# Current live query -> Returns PostgreSQL
current = db.recall("What database do we use?")
print(current[0].content)  # -> "PostgreSQL 16 on port 5432"

# Historical time-travel query -> Returns MySQL (Zero amnesia!)
past = db.recall("What database do we use?", as_of="2025-06-01T00:00:00Z")
print(past[0].content)     # -> "MySQL 8.0 on port 3306"
```

---

## 📦 Project Structure

* `docs/` — Architecture design, formal temporal specifications, and API guides.
* `research/` — Literature matrices, academic survey review paper, and empirical research paper with benchmark receipts.
* `app/recalldb/` — Embedded core storage, bitemporal ranker, lexical/vector search, and CLI.
* `app/bench/` — Reproducible benchmarking harness, metric suite, and dataset adapters.
* `landing-page/` — Interactive web demonstration and visual memory timeline inspector.

---

## 📚 Citation

If you use RecallDB in your research, software agents, or benchmarks, please cite our technical paper:

```bibtex
@article{varman2026recalldb,
  title={RecallDB: A Local-First, Bitemporal Hybrid Engine for Long-Horizon Agent Memory and Decoupled Evaluation},
  author={Varman K, Arunmozhi},
  journal={Bloombig AI Systems Research Preprint},
  year={2026},
  doi={10.5281/zenodo.23107756},
  url={https://doi.org/10.5281/zenodo.23107756}
}
```

---

## 📜 License

MIT License © 2026 Arunmozhi Varman K. Free for academic, personal, and commercial software agent development.


MIT License. Developed for open-source AI agent research.
