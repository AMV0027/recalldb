"""
Prompt synthesis and memory formatting utilities for RecallDB.
Formats point-in-time memories into concise, hallucination-resistant context.
"""

from typing import List, Dict, Any, Optional
from recalldb.core.memory import MemoryRecord, RetrievalResult


def format_memories_as_markdown(
    results: List[Any],
    as_of: Optional[str] = None
) -> str:
    """
    Format a list of RetrievalResult or MemoryRecord objects into a clean,
    structured markdown context block suitable for injection into any LLM prompt.
    """
    if not results:
        return "### RECALLDB MEMORY CONTEXT:\nNo relevant prior memories found for this query/timeframe.\n"

    target_time = as_of if as_of else "PRESENT (Current Active State)"
    lines = [
        "### RECALLDB VERIFIED MEMORY CONTEXT:",
        f"Evaluation Epoch: {target_time}",
        "The following factual assertions were retrieved from persistent bitemporal storage:",
    ]

    for item in results:
        rec: MemoryRecord = item.record if hasattr(item, "record") else item
        state_str = rec.state.upper()
        valid_until_str = rec.valid_until or "Present"
        time_scope = f"Valid: {rec.valid_from or 'Unknown'} -> {valid_until_str}"
        lines.append(f"- [{rec.id[:10]}] ({time_scope} | State: {state_str})")
        lines.append(f"  Assertion: {rec.content.strip()}")

    lines.append("\nINSTRUCTIONS:")
    lines.append("- Base your answers strictly on the verified memories above.")
    lines.append("- If answering for a historical date, only cite assertions valid during that epoch.")
    lines.append("- Do not confuse historical superseded configurations with current active configurations.")

    return "\n".join(lines)


def build_augmented_system_prompt(
    base_prompt: Optional[str],
    memories: List[Any],
    as_of: Optional[str] = None
) -> str:
    """
    Synthesize an augmented system prompt combining base instructions with verified memories.
    """
    memory_block = format_memories_as_markdown(memories, as_of=as_of)
    if not base_prompt:
        return memory_block
    return f"{base_prompt.strip()}\n\n{memory_block}"


def inject_context_into_messages(
    messages: List[Dict[str, Any]],
    memories: List[Any],
    as_of: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Injects memory context into an OpenAI/Anthropic/Ollama compatible messages list.
    If a system message is present, appends memories to it. Otherwise, prepends a new system message.
    """
    memory_block = format_memories_as_markdown(memories, as_of=as_of)
    augmented = [dict(m) for m in messages]

    system_idx = -1
    for i, m in enumerate(augmented):
        if m.get("role") == "system":
            system_idx = i
            break

    if system_idx >= 0:
        orig_content = augmented[system_idx].get("content", "")
        augmented[system_idx]["content"] = f"{orig_content.strip()}\n\n{memory_block}"
    else:
        augmented.insert(0, {
            "role": "system",
            "content": f"You are a helpful AI assistant backed by persistent RecallDB memory.\n\n{memory_block}"
        })

    return augmented
