"""
Lexical retrieval engine using SQLite FTS5 with monotonic BM25 ranking.
Supports scope filtering and allowed ID pre-filtering.
"""

from typing import List, Tuple, Dict, Optional, Set
import re
from recalldb.storage.db import Database


def sanitize_fts_query(query: str) -> str:
    """
    Sanitize raw query string into safe SQLite FTS5 syntax.
    Extracts alphanumeric tokens and preserved symbols, joined with OR.
    """
    words = re.findall(r"[\w]+", query)
    if not words:
        return '""'
    terms = [f'"{w}"' for w in words if w.strip()]
    return " OR ".join(terms)


class LexicalRetriever:
    """Executes BM25 searches over the memories_fts index."""

    def __init__(self, db: Database):
        self.db = db

    def search(
        self,
        query: str,
        top_k: int = 50,
        allowed_ids: Optional[Set[str]] = None,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> List[Tuple[str, float]]:
        """
        Execute FTS5 BM25 search with optional scope and ID pre-filtering.
        Returns list of (memory_id, normalized_bm25_score) tuples,
        sorted descending by relevance.
        """
        sanitized = sanitize_fts_query(query)
        if sanitized == '""':
            return []

        # Join with memories table to enforce scope if requested
        if tenant_id or user_id or thread_id:
            clauses = ["m.id = fts.id"]
            params = [sanitized]
            if tenant_id:
                clauses.append("m.tenant_id = ?")
                params.append(tenant_id)
            if user_id:
                clauses.append("m.user_id = ?")
                params.append(user_id)
            if thread_id:
                clauses.append("m.thread_id = ?")
                params.append(thread_id)
            where_sql = " AND ".join(clauses)
            sql = f"""
            SELECT fts.id, bm25(memories_fts) as raw_rank
            FROM memories_fts fts, memories m
            WHERE memories_fts MATCH ? AND {where_sql}
            ORDER BY raw_rank ASC
            LIMIT ?
            """
            params.append(top_k * 2)
        else:
            sql = """
            SELECT id, bm25(memories_fts) as raw_rank
            FROM memories_fts
            WHERE memories_fts MATCH ?
            ORDER BY raw_rank ASC
            LIMIT ?
            """
            params = [sanitized, top_k * 2]

        raw_results = []
        with self.db.get_connection() as conn:
            try:
                cur = conn.execute(sql, params)
                rows = cur.fetchall()
                for row in rows:
                    mid = row["id"]
                    if allowed_ids is not None and mid not in allowed_ids:
                        continue
                    raw_results.append((mid, float(row["raw_rank"])))
                    if len(raw_results) >= top_k:
                        break
            except Exception:
                return []

        if not raw_results:
            return []

        ranks = [r[1] for r in raw_results]
        min_rank = min(ranks)
        max_rank = max(ranks)

        results = []
        rank_range = max_rank - min_rank

        for mem_id, r in raw_results:
            if rank_range > 1e-6:
                norm_score = 0.2 + 0.8 * ((max_rank - r) / rank_range)
            else:
                relevance = max(0.0, -r)
                norm_score = min(1.0, 0.70 + 0.30 * (relevance / (1.0 + relevance)))
            results.append((mem_id, norm_score))

        return results
