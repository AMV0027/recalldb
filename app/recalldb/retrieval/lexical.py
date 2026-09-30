"""
Lexical retrieval engine using SQLite FTS5 with monotonic BM25 ranking.
"""

from typing import List, Tuple, Dict
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

    def search(self, query: str, top_k: int = 50) -> List[Tuple[str, float]]:
        """
        Execute FTS5 BM25 search.
        Returns list of (memory_id, normalized_bm25_score) tuples,
        sorted descending by relevance (best match has score closest to 1.0).
        """
        sanitized = sanitize_fts_query(query)
        if sanitized == '""':
            return []

        sql = """
        SELECT id, bm25(memories_fts) as raw_rank
        FROM memories_fts
        WHERE memories_fts MATCH ?
        ORDER BY raw_rank ASC
        LIMIT ?
        """

        raw_results = []
        with self.db.get_connection() as conn:
            try:
                cur = conn.execute(sql, (sanitized, top_k))
                rows = cur.fetchall()
                for row in rows:
                    raw_results.append((row["id"], float(row["raw_rank"])))
            except Exception:
                return []

        if not raw_results:
            return []

        # SQLite FTS5 bm25() returns negative numbers:
        # Smaller (more negative) values represent higher relevance.
        ranks = [r[1] for r in raw_results]
        min_rank = min(ranks)  # Most relevant (e.g. -5.4)
        max_rank = max(ranks)  # Least relevant (e.g. -0.2)

        results = []
        rank_range = max_rank - min_rank

        for mem_id, r in raw_results:
            if rank_range > 1e-6:
                # Min-max normalization: best match (min_rank) -> 1.0, worst -> 0.2
                norm_score = 0.2 + 0.8 * ((max_rank - r) / rank_range)
            else:
                # Single item or identical scores: genuine match scaled to [0.7, 1.0]
                relevance = max(0.0, -r)
                norm_score = min(1.0, 0.70 + 0.30 * (relevance / (1.0 + relevance)))
            results.append((mem_id, float(norm_score)))

        return results
