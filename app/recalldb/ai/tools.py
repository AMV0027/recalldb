"""
Function-calling tool schemas and autonomous execution dispatch for RecallDB.
Provides standard schemas for OpenAI, Anthropic, Ollama, and LangChain tool systems.
"""

from typing import Dict, Any, List, Optional
import json


def get_openai_tools() -> List[Dict[str, Any]]:
    """Return tool schemas compatible with OpenAI / Ollama / Groq tool calling."""
    return [
        {
            "type": "function",
            "function": {
                "name": "recall_memory",
                "description": "Retrieve verified factual memories from persistent bitemporal storage using hybrid semantic and lexical search.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query to match against persistent memories."
                        },
                        "as_of": {
                            "type": "string",
                            "description": "Optional ISO-8601 timestamp for historical time-travel queries (e.g. '2025-06-01T00:00:00Z'). Defaults to present."
                        },
                        "k": {
                            "type": "integer",
                            "description": "Number of relevant memories to retrieve. Default is 3."
                        }
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "remember_fact",
                "description": "Store a new factual assertion in persistent bitemporal memory.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The concise factual statement to remember."
                        },
                        "valid_from": {
                            "type": "string",
                            "description": "Optional ISO-8601 start timestamp when this fact became true. Defaults to now."
                        },
                        "importance": {
                            "type": "number",
                            "description": "Importance score between 0.0 and 1.0. Defaults to 0.8."
                        }
                    },
                    "required": ["content"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "supersede_fact",
                "description": "Atomically update an existing memory by marking the old memory superseded while preserving the full historical audit trail.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "old_memory_id": {
                            "type": "string",
                            "description": "The unique ID of the obsolete memory being superseded."
                        },
                        "new_content": {
                            "type": "string",
                            "description": "The updated factual assertion that replaces the obsolete memory."
                        },
                        "transition_time": {
                            "type": "string",
                            "description": "Optional ISO-8601 timestamp at which this update became effective."
                        }
                    },
                    "required": ["old_memory_id", "new_content"]
                }
            }
        }
    ]


def execute_tool_call(db: Any, tool_name: str, arguments: Dict[str, Any], **scope_kwargs) -> Dict[str, Any]:
    """Execute a function call returned by an LLM on a RecallDB instance."""
    if isinstance(arguments, str):
        try:
            arguments = json.loads(arguments)
        except Exception:
            arguments = {}

    if tool_name == "recall_memory":
        query = arguments.get("query", "")
        as_of = arguments.get("as_of")
        k = int(arguments.get("k", 3))
        results = db.recall(query=query, k=k, as_of=as_of, **scope_kwargs)
        return {
            "query": query,
            "as_of": as_of,
            "count": len(results),
            "memories": [
                {
                    "id": r.id,
                    "content": r.content,
                    "valid_from": r.valid_from,
                    "valid_until": r.valid_until,
                    "state": r.state,
                    "score": r.score
                }
                for r in results
            ]
        }

    elif tool_name == "remember_fact":
        content = arguments.get("content", "")
        valid_from = arguments.get("valid_from")
        importance = float(arguments.get("importance", 0.8))
        rec = db.remember(content=content, valid_from=valid_from, importance=importance, **scope_kwargs)
        return {
            "status": "success",
            "id": rec.id,
            "content": rec.content,
            "state": rec.state,
            "valid_from": rec.valid_from
        }

    elif tool_name == "supersede_fact":
        old_id = arguments.get("old_memory_id", "")
        new_content = arguments.get("new_content", "")
        transition_time = arguments.get("transition_time")
        rec = db.supersede(
            old_memory_id=old_id,
            new_fact=new_content,
            transition_time=transition_time,
            **scope_kwargs
        )
        return {
            "status": "success",
            "superseded_id": old_id,
            "new_id": rec.id,
            "new_content": rec.content,
            "state": rec.state
        }

    else:
        return {"error": f"Unknown RecallDB tool: {tool_name}"}
