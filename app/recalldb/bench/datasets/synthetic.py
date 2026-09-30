"""
Synthetic Temporal Benchmark Dataset (SynTemp-100).
Generates controlled factual lifecycles, bitemporal state transitions,
supersession chains, and historical query benchmarks across 10 technology domains.
"""

from typing import List
from recalldb.bench.datasets.base import BaseBenchmarkDataset, MemoryIngestItem, BenchmarkExample


class SyntheticTemporalDataset(BaseBenchmarkDataset):
    """
    Standardized synthetic benchmark evaluating historical recall, present state accuracy,
    and exact keyword recovery across 10 domains with bitemporal supersession chains.
    """

    def name(self) -> str:
        return "syntemp-100"

    def get_ingest_data(self) -> List[MemoryIngestItem]:
        items = []

        # Domain 1: Backend Language (2022 -> 2024 -> 2026)
        items.extend([
            MemoryIngestItem(
                content="Primary backend programming language is Python 3.10 with FastAPI",
                event_time="2022-01-15",
                valid_from="2022-01-15",
                source="audit:session_01"
            ),
            MemoryIngestItem(
                content="Primary backend programming language migrated to Go 1.22 with Gin framework",
                event_time="2024-03-01",
                valid_from="2024-03-01",
                source="audit:session_12",
                supersedes_content="Primary backend programming language is Python 3.10 with FastAPI"
            ),
            MemoryIngestItem(
                content="Primary backend programming language finalized on Rust 1.80 with Axum runtime",
                event_time="2026-01-10",
                valid_from="2026-01-10",
                source="audit:session_35",
                supersedes_content="Primary backend programming language migrated to Go 1.22 with Gin framework"
            ),
        ])

        # Domain 2: Transactional Database (2021 -> 2023 -> 2025)
        items.extend([
            MemoryIngestItem(
                content="Production transactional database runs on MySQL 8.0 cluster",
                event_time="2021-06-01",
                valid_from="2021-06-01",
                source="infra:db_init"
            ),
            MemoryIngestItem(
                content="Production transactional database migrated to PostgreSQL 15 on AWS RDS",
                event_time="2023-09-15",
                valid_from="2023-09-15",
                source="infra:rds_migration",
                supersedes_content="Production transactional database runs on MySQL 8.0 cluster"
            ),
            MemoryIngestItem(
                content="Production transactional database upgraded to PostgreSQL 17 on AWS Aurora Serverless",
                event_time="2025-05-20",
                valid_from="2025-05-20",
                source="infra:aurora_migration",
                supersedes_content="Production transactional database migrated to PostgreSQL 15 on AWS RDS"
            ),
        ])

        # Domain 3: Engineering Headquarters (2020 -> 2023 -> 2025)
        items.extend([
            MemoryIngestItem(
                content="The engineering office is situated in Chennai, Tamil Nadu",
                event_time="2020-01-01",
                valid_from="2020-01-01",
                source="hr:location"
            ),
            MemoryIngestItem(
                content="The engineering office relocated to Coimbatore, Tamil Nadu",
                event_time="2023-02-01",
                valid_from="2023-02-01",
                source="hr:location_change",
                supersedes_content="The engineering office is situated in Chennai, Tamil Nadu"
            ),
            MemoryIngestItem(
                content="The engineering office expanded to Bangalore HSR Layout",
                event_time="2025-07-01",
                valid_from="2025-07-01",
                source="hr:expansion",
                supersedes_content="The engineering office relocated to Coimbatore, Tamil Nadu"
            ),
        ])

        # Domain 4: Cloud Infrastructure & Orchestration (2022 -> 2024 -> 2026)
        items.extend([
            MemoryIngestItem(
                content="Deployment orchestrator is HashiCorp Nomad with Consul service mesh",
                event_time="2022-04-10",
                valid_from="2022-04-10",
                source="devops:nomad"
            ),
            MemoryIngestItem(
                content="Deployment orchestrator migrated to Kubernetes EKS cluster v1.28",
                event_time="2024-05-15",
                valid_from="2024-05-15",
                source="devops:k8s",
                supersedes_content="Deployment orchestrator is HashiCorp Nomad with Consul service mesh"
            ),
            MemoryIngestItem(
                content="Deployment orchestrator modernized with Cilium eBPF on Kubernetes EKS v1.32",
                event_time="2026-02-01",
                valid_from="2026-02-01",
                source="devops:cilium",
                supersedes_content="Deployment orchestrator migrated to Kubernetes EKS cluster v1.28"
            ),
        ])

        # Domain 5: Message Queue Architecture (2022 -> 2025)
        items.extend([
            MemoryIngestItem(
                content="Asynchronous message broker is RabbitMQ with AMQP protocol",
                event_time="2022-08-01",
                valid_from="2022-08-01",
                source="arch:queue"
            ),
            MemoryIngestItem(
                content="Asynchronous message broker replaced by Apache Kafka streaming cluster",
                event_time="2025-01-10",
                valid_from="2025-01-10",
                source="arch:kafka",
                supersedes_content="Asynchronous message broker is RabbitMQ with AMQP protocol"
            ),
        ])

        # Domain 6: Exact Alphanumeric Identifiers & Security Keys
        items.extend([
            MemoryIngestItem(
                content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                event_time="2024-01-01",
                valid_from="2024-01-01",
                source="security:vault"
            ),
            MemoryIngestItem(
                content="Prometheus metrics scrape exporter listens on internal port 9090",
                event_time="2024-01-02",
                valid_from="2024-01-02",
                source="infra:monitoring"
            ),
            MemoryIngestItem(
                content="Primary internal gateway IPv4 address is 10.240.18.52 on VLAN 402",
                event_time="2024-01-03",
                valid_from="2024-01-03",
                source="net:inventory"
            ),
            MemoryIngestItem(
                content="Staging environment Kubernetes cluster API endpoint is api-stg-k8s.internal.lan:6443",
                event_time="2024-01-04",
                valid_from="2024-01-04",
                source="net:inventory"
            ),
        ])

        # Domain 7: Frontend Framework (2021 -> 2024)
        items.extend([
            MemoryIngestItem(
                content="Web application frontend is built with Vue 3 and Vuex store",
                event_time="2021-03-01",
                valid_from="2021-03-01",
                source="web:frontend"
            ),
            MemoryIngestItem(
                content="Web application frontend rewritten in React 18 with Zustand and Tailwind",
                event_time="2024-04-10",
                valid_from="2024-04-10",
                source="web:react_rewrite",
                supersedes_content="Web application frontend is built with Vue 3 and Vuex store"
            ),
        ])

        # Domain 8: Primary LLM Model (2023 -> 2024 -> 2026)
        items.extend([
            MemoryIngestItem(
                content="Default foundational LLM for agent reasoning is GPT-4-0613",
                event_time="2023-07-01",
                valid_from="2023-07-01",
                source="ai:models"
            ),
            MemoryIngestItem(
                content="Default foundational LLM for agent reasoning transitioned to Claude 3.5 Sonnet",
                event_time="2024-10-01",
                valid_from="2024-10-01",
                source="ai:models",
                supersedes_content="Default foundational LLM for agent reasoning is GPT-4-0613"
            ),
            MemoryIngestItem(
                content="Default foundational LLM for agent reasoning upgraded to Gemini 2.5 Pro",
                event_time="2026-03-01",
                valid_from="2026-03-01",
                source="ai:models",
                supersedes_content="Default foundational LLM for agent reasoning transitioned to Claude 3.5 Sonnet"
            ),
        ])

        # Domain 9: User UI & Theme Preferences
        items.extend([
            MemoryIngestItem(
                content="User preferred developer theme is Tokyo Night Storm",
                event_time="2023-05-01",
                valid_from="2023-05-01",
                source="user:prefs"
            ),
            MemoryIngestItem(
                content="User preferred developer theme changed to GitHub Dark High Contrast",
                event_time="2025-02-01",
                valid_from="2025-02-01",
                source="user:prefs",
                supersedes_content="User preferred developer theme is Tokyo Night Storm"
            ),
        ])

        # Domain 10: Auth Token Secret
        items.extend([
            MemoryIngestItem(
                content="Production JWT signing key secret rotated to KEY_ROT_99812_SEC",
                event_time="2025-06-01",
                valid_from="2025-06-01",
                source="security:keys"
            )
        ])

        return items

    def get_queries(self) -> List[BenchmarkExample]:
        queries = []

        # Category 1: Historical Point-in-Time Queries (Testing past state retrieval)
        queries.extend([
            BenchmarkExample(
                id="q_hist_lang_2022",
                query="What backend programming language was being used?",
                query_time="2022-06-01",
                expected_answer_keywords=["Python", "FastAPI"],
                ground_truth_memory_content="Primary backend programming language is Python 3.10 with FastAPI",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_lang_2023",
                query="What backend programming language did the system use?",
                query_time="2023-05-01",
                expected_answer_keywords=["Python"],
                ground_truth_memory_content="Primary backend programming language is Python 3.10 with FastAPI",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_lang_2024",
                query="What backend programming language was the team utilizing?",
                query_time="2024-06-01",
                expected_answer_keywords=["Go", "Gin"],
                ground_truth_memory_content="Primary backend programming language migrated to Go 1.22 with Gin framework",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_db_2022",
                query="What transactional database was the production cluster running?",
                query_time="2022-01-01",
                expected_answer_keywords=["MySQL"],
                ground_truth_memory_content="Production transactional database runs on MySQL 8.0 cluster",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_db_2024",
                query="What database engine was running for transactions?",
                query_time="2024-01-01",
                expected_answer_keywords=["PostgreSQL", "RDS"],
                ground_truth_memory_content="Production transactional database migrated to PostgreSQL 15 on AWS RDS",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_office_2021",
                query="Where was the engineering headquarters located?",
                query_time="2021-05-01",
                expected_answer_keywords=["Chennai"],
                ground_truth_memory_content="The engineering office is situated in Chennai, Tamil Nadu",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_office_2024",
                query="Where was the engineering office situated?",
                query_time="2024-01-01",
                expected_answer_keywords=["Coimbatore"],
                ground_truth_memory_content="The engineering office relocated to Coimbatore, Tamil Nadu",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_orchestrator_2023",
                query="What deployment orchestrator was in use?",
                query_time="2023-01-01",
                expected_answer_keywords=["Nomad", "Consul"],
                ground_truth_memory_content="Deployment orchestrator is HashiCorp Nomad with Consul service mesh",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_queue_2023",
                query="What message queue was being used for async jobs?",
                query_time="2023-01-01",
                expected_answer_keywords=["RabbitMQ"],
                ground_truth_memory_content="Asynchronous message broker is RabbitMQ with AMQP protocol",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_frontend_2022",
                query="What framework was used to build the web frontend?",
                query_time="2022-01-01",
                expected_answer_keywords=["Vue"],
                ground_truth_memory_content="Web application frontend is built with Vue 3 and Vuex store",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_llm_2023",
                query="What was the default LLM used for agent reasoning?",
                query_time="2023-08-01",
                expected_answer_keywords=["GPT-4"],
                ground_truth_memory_content="Default foundational LLM for agent reasoning is GPT-4-0613",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_llm_2024",
                query="Which LLM model was the primary engine for agents?",
                query_time="2024-11-01",
                expected_answer_keywords=["Claude"],
                ground_truth_memory_content="Default foundational LLM for agent reasoning transitioned to Claude 3.5 Sonnet",
                is_historical=True
            ),
            BenchmarkExample(
                id="q_hist_theme_2024",
                query="What color theme did the user prefer?",
                query_time="2024-01-01",
                expected_answer_keywords=["Tokyo", "Night"],
                ground_truth_memory_content="User preferred developer theme is Tokyo Night Storm",
                is_historical=True
            ),
        ])

        # Category 2: Current / Present State Queries (Testing exclusion of superseded records)
        queries.extend([
            BenchmarkExample(
                id="q_curr_lang_2026",
                query="What backend programming language is currently used?",
                query_time="2026-06-01",
                expected_answer_keywords=["Rust", "Axum"],
                ground_truth_memory_content="Primary backend programming language finalized on Rust 1.80 with Axum runtime",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_db_2026",
                query="What database is used for production transactions?",
                query_time="2026-01-01",
                expected_answer_keywords=["PostgreSQL", "Aurora"],
                ground_truth_memory_content="Production transactional database upgraded to PostgreSQL 17 on AWS Aurora Serverless",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_office_2026",
                query="Where is the engineering office currently situated?",
                query_time="2026-01-01",
                expected_answer_keywords=["Bangalore"],
                ground_truth_memory_content="The engineering office expanded to Bangalore HSR Layout",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_orchestrator_2026",
                query="What orchestrator manages cloud deployments?",
                query_time="2026-06-01",
                expected_answer_keywords=["Kubernetes", "Cilium"],
                ground_truth_memory_content="Deployment orchestrator modernized with Cilium eBPF on Kubernetes EKS v1.32",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_queue_2026",
                query="What message broker handles event streaming?",
                query_time="2026-01-01",
                expected_answer_keywords=["Kafka"],
                ground_truth_memory_content="Asynchronous message broker replaced by Apache Kafka streaming cluster",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_frontend_2026",
                query="What frontend framework does the web application use?",
                query_time="2026-01-01",
                expected_answer_keywords=["React", "Tailwind"],
                ground_truth_memory_content="Web application frontend rewritten in React 18 with Zustand and Tailwind",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_llm_2026",
                query="What is the default foundational LLM for agent reasoning?",
                query_time="2026-06-01",
                expected_answer_keywords=["Gemini"],
                ground_truth_memory_content="Default foundational LLM for agent reasoning upgraded to Gemini 2.5 Pro",
                is_historical=False,
                is_update_query=True
            ),
            BenchmarkExample(
                id="q_curr_theme_2026",
                query="What theme does the user currently prefer in the editor?",
                query_time="2026-01-01",
                expected_answer_keywords=["GitHub", "Contrast"],
                ground_truth_memory_content="User preferred developer theme changed to GitHub Dark High Contrast",
                is_historical=False,
                is_update_query=True
            ),
        ])

        # Category 3: Exact Technical Identifiers & Alphanumeric Tokens (Lexical stress test)
        queries.extend([
            BenchmarkExample(
                id="q_token_redis_port",
                query="What port does Redis sentinel listen on?",
                query_time="2026-01-01",
                expected_answer_keywords=["6379", "Redis"],
                ground_truth_memory_content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                is_historical=False
            ),
            BenchmarkExample(
                id="q_token_redis_auth",
                query="What is the Redis auth key SEC_9921_XQ?",
                query_time="2026-01-01",
                expected_answer_keywords=["SEC_9921_XQ"],
                ground_truth_memory_content="Production Redis sentinel cluster listens on port 6379 with auth key SEC_9921_XQ",
                is_historical=False
            ),
            BenchmarkExample(
                id="q_token_prom_port",
                query="What port does the Prometheus metrics exporter use?",
                query_time="2026-01-01",
                expected_answer_keywords=["9090", "Prometheus"],
                ground_truth_memory_content="Prometheus metrics scrape exporter listens on internal port 9090",
                is_historical=False
            ),
            BenchmarkExample(
                id="q_token_gateway_ip",
                query="What is the internal gateway IPv4 address 10.240.18.52?",
                query_time="2026-01-01",
                expected_answer_keywords=["10.240.18.52", "VLAN"],
                ground_truth_memory_content="Primary internal gateway IPv4 address is 10.240.18.52 on VLAN 402",
                is_historical=False
            ),
            BenchmarkExample(
                id="q_token_k8s_endpoint",
                query="What is the staging Kubernetes API endpoint api-stg-k8s.internal.lan:6443?",
                query_time="2026-01-01",
                expected_answer_keywords=["api-stg-k8s.internal.lan:6443"],
                ground_truth_memory_content="Staging environment Kubernetes cluster API endpoint is api-stg-k8s.internal.lan:6443",
                is_historical=False
            ),
            BenchmarkExample(
                id="q_token_jwt_secret",
                query="What is the rotated production JWT secret KEY_ROT_99812_SEC?",
                query_time="2026-01-01",
                expected_answer_keywords=["KEY_ROT_99812_SEC"],
                ground_truth_memory_content="Production JWT signing key secret rotated to KEY_ROT_99812_SEC",
                is_historical=False
            ),
        ])

        return queries
