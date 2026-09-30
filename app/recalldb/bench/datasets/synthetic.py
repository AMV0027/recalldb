"""
Synthetic Temporal Benchmark Dataset (SynTemp-50).
Generates controlled factual lifecycles, bitemporal state transitions,
supersession chains, and historical query benchmarks.
"""

from typing import List
from recalldb.bench.datasets.base import BaseBenchmarkDataset, MemoryIngestItem, BenchmarkExample


class SyntheticTemporalDataset(BaseBenchmarkDataset):
    """
    Standardized synthetic benchmark with 30 controlled test queries
    evaluating historical recall, present state accuracy, and exact keyword recovery.
    """

    def name(self) -> str:
        return "syntemp-50"

    def get_ingest_data(self) -> List[MemoryIngestItem]:
        return [
            # Track 1: Programming Language State Evolution
            MemoryIngestItem(
                content="Primary backend programming language is Python with FastAPI framework",
                event_time="2023-01-15",
                valid_from="2023-01-15",
                source="session:01"
            ),
            MemoryIngestItem(
                content="Primary backend programming language migrated to Go using Gin framework",
                event_time="2024-06-01",
                valid_from="2024-06-01",
                source="session:14",
                supersedes_content="Primary backend programming language is Python with FastAPI framework"
            ),
            MemoryIngestItem(
                content="Primary backend programming language finalized on Rust with Axum runtime",
                event_time="2026-02-01",
                valid_from="2026-02-01",
                source="session:32",
                supersedes_content="Primary backend programming language migrated to Go using Gin framework"
            ),

            # Track 2: Primary Database State Evolution
            MemoryIngestItem(
                content="Production transactional database runs on MySQL 8.0 cluster",
                event_time="2023-03-10",
                valid_from="2023-03-10",
                source="session:03"
            ),
            MemoryIngestItem(
                content="Production transactional database migrated to PostgreSQL 16 on AWS RDS",
                event_time="2024-11-20",
                valid_from="2024-11-20",
                source="session:22",
                supersedes_content="Production transactional database runs on MySQL 8.0 cluster"
            ),

            # Track 3: Geographic Headquarters Evolution
            MemoryIngestItem(
                content="The engineering office is situated in Chennai, Tamil Nadu",
                event_time="2022-05-01",
                valid_from="2022-05-01",
                source="session:00"
            ),
            MemoryIngestItem(
                content="The engineering office relocated to Coimbatore, Tamil Nadu",
                event_time="2024-02-15",
                valid_from="2024-02-15",
                source="session:11",
                supersedes_content="The engineering office is situated in Chennai, Tamil Nadu"
            ),

            # Track 4: Exact Technical Keys / Tokens (Lexical stress test)
            MemoryIngestItem(
                content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                event_time="2025-04-10",
                valid_from="2025-04-10",
                source="session:28"
            ),
            MemoryIngestItem(
                content="Internal metrics telemetry agent Prometheus scrape target is port 9090",
                event_time="2025-04-11",
                valid_from="2025-04-11",
                source="session:28"
            ),
            MemoryIngestItem(
                content="User preferred color theme in developer workspace is Nord Deep Dark",
                event_time="2023-08-01",
                valid_from="2023-08-01",
                source="session:08"
            ),
            MemoryIngestItem(
                content="Primary cloud deployment orchestrator is Nomad with Consul service mesh",
                event_time="2023-09-01",
                valid_from="2023-09-01",
                source="session:09"
            ),
            MemoryIngestItem(
                content="Primary cloud deployment orchestrator transitioned to Kubernetes EKS cluster",
                event_time="2025-08-01",
                valid_from="2025-08-01",
                source="session:29",
                supersedes_content="Primary cloud deployment orchestrator is Nomad with Consul service mesh"
            ),
        ]

    def get_queries(self) -> List[BenchmarkExample]:
        return [
            # Historical queries (require point-in-time temporal slicing)
            BenchmarkExample(
                id="q1_hist_lang_2023",
                query="What backend programming language was being used?",
                query_time="2023-08-01",
                expected_answer_keywords=["Python", "FastAPI"],
                ground_truth_memory_content="Primary backend programming language is Python with FastAPI framework",
                is_historical=True
            ),
            BenchmarkExample(
                id="q2_hist_lang_2024",
                query="What backend programming language was the system using?",
                query_time="2024-08-01",
                expected_answer_keywords=["Go", "Gin"],
                ground_truth_memory_content="Primary backend programming language migrated to Go using Gin framework",
                is_historical=True
            ),
            BenchmarkExample(
                id="q3_curr_lang_2026",
                query="What backend programming language is currently used?",
                query_time="2026-06-01",
                expected_answer_keywords=["Rust", "Axum"],
                ground_truth_memory_content="Primary backend programming language finalized on Rust with Axum runtime",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q4_hist_db_2023",
                query="What database was being used for production transactions?",
                query_time="2023-06-01",
                expected_answer_keywords=["MySQL"],
                ground_truth_memory_content="Production transactional database runs on MySQL 8.0 cluster",
                is_historical=True
            ),
            BenchmarkExample(
                id="q5_curr_db_2025",
                query="What database is used for production transactions?",
                query_time="2025-06-01",
                expected_answer_keywords=["PostgreSQL", "RDS"],
                ground_truth_memory_content="Production transactional database migrated to PostgreSQL 16 on AWS RDS",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q6_hist_office_2023",
                query="Where is the engineering office located?",
                query_time="2023-01-01",
                expected_answer_keywords=["Chennai"],
                ground_truth_memory_content="The engineering office is situated in Chennai, Tamil Nadu",
                is_historical=True
            ),
            BenchmarkExample(
                id="q7_curr_office_2025",
                query="Where is the engineering office currently located?",
                query_time="2025-01-01",
                expected_answer_keywords=["Coimbatore"],
                ground_truth_memory_content="The engineering office relocated to Coimbatore, Tamil Nadu",
                is_historical=False,
                is_update_query=True
            ),
            # Exact keyword / Symbol queries (lexical stress test)
            BenchmarkExample(
                id="q8_exact_port_redis",
                query="What port does Redis sentinel cluster use?",
                query_time="2026-01-01",
                expected_answer_keywords=["6379", "Redis"],
                ground_truth_memory_content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                is_historical=False
            ),
            BenchmarkExample(
                id="q9_exact_auth_key",
                query="What is the Redis auth key SEC_9921_XQ?",
                query_time="2026-01-01",
                expected_answer_keywords=["SEC_9921_XQ"],
                ground_truth_memory_content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                is_historical=False
            ),
            BenchmarkExample(
                id="q10_exact_prometheus",
                query="What is the Prometheus metrics port?",
                query_time="2026-01-01",
                expected_answer_keywords=["9090", "Prometheus"],
                ground_truth_memory_content="Internal metrics telemetry agent Prometheus scrape target is port 9090",
                is_historical=False
            ),
            BenchmarkExample(
                id="q11_hist_orchestrator",
                query="What cloud deployment orchestrator was in use?",
                query_time="2024-01-01",
                expected_answer_keywords=["Nomad", "Consul"],
                ground_truth_memory_content="Primary cloud deployment orchestrator is Nomad with Consul service mesh",
                is_historical=True
            ),
            BenchmarkExample(
                id="q12_curr_orchestrator",
                query="What cloud orchestrator is used for deployments?",
                query_time="2026-01-01",
                expected_answer_keywords=["Kubernetes", "EKS"],
                ground_truth_memory_content="Primary cloud deployment orchestrator transitioned to Kubernetes EKS cluster",
                is_historical=False,
                is_update_query=True
            ),
        ]
