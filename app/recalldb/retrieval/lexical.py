"""
Lexical retrieval engine using SQLite FTS5 with BM25 ranking.
"""

from typing import List, Tuple, Dict
import re
from recalldb.storage.db import Database


def sanitize_fts_query(query: str) -> str:
    """
    Sanitize raw query string into safe SQLite FTS5 syntax.
    Tokenizes words and joins them with OR / NEAR operators.
    """
    words = re.findall(r"\w+", query)
    if not words:
        return '""'
    # Match any of the distinct tokens or phrase matches
    terms = [f'"{w}"' for w in words]
    return " OR ".join(terms)


class LexicalRetriever:
    """Executes BM25 searches over the memories_fts index."""

    def __init__(self, db: Database):
        self.db = db

    def search(self, query: str, top_k: int = 50) -> List[Tuple[str, float]]:
        """
        Execute FTS5 BM25 search.
        Returns list of (memory_id, normalized_bm25_score) tuples,
        sorted descending by relevance.
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

        results = []
        with self.db.get_connection() as conn:
            try:
                cur = conn.execute(sql, (sanitized, top_k))
                rows = cur.fetchall()
                for row in rows:
                    mem_id = row["id"]
                    raw_rank = row["raw_rank"]
                    # SQLite BM25 returns more negative scores for better matches.
                    # Normalize to [0.0, 1.0] where higher is better:
                    norm_score = 1.0 / (1.0 + max(0.0, abs(raw_rank)))
                    results.append((mem_id, norm_score))
            except Exception:
                # Fallback if FTS syntax error
                return []
        return results
