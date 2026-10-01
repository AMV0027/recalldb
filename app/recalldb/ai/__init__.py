"""
RecallDB AI Provider Hub & Integration Layer.
Seamless connectivity to Ollama, OpenAI, Anthropic, and custom LLMs.
"""

from typing import Optional, Union, Dict, Any
from recalldb.ai.base import BaseAIProvider, AIResponse
from recalldb.ai.ollama import OllamaProvider
from recalldb.ai.openai import OpenAIProvider
from recalldb.ai.anthropic import AnthropicProvider
from recalldb.ai.prompt import (
    format_memories_as_markdown,
    build_augmented_system_prompt,
    inject_context_into_messages,
)
from recalldb.ai.tools import get_openai_tools, execute_tool_call


def get_provider(
    provider_name: Union[str, BaseAIProvider] = "ollama",
    **kwargs
) -> BaseAIProvider:
    """
    Factory creating configured AI provider instances.
    Supports 'ollama', 'openai', 'anthropic', or custom BaseAIProvider.
    """
    if isinstance(provider_name, BaseAIProvider):
        return provider_name

    p = provider_name.lower().strip()
    if p == "ollama":
        return OllamaProvider(**kwargs)
    elif p in ("openai", "groq", "deepseek", "openrouter", "together"):
        return OpenAIProvider(**kwargs)
    elif p == "anthropic":
        return AnthropicProvider(**kwargs)
    else:
        raise ValueError(
            f"Unsupported AI provider: '{provider_name}'. "
            f"Supported providers: 'ollama', 'openai', 'anthropic' or a custom BaseAIProvider subclass."
        )


__all__ = [
    "BaseAIProvider",
    "AIResponse",
    "OllamaProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "get_provider",
    "format_memories_as_markdown",
    "build_augmented_system_prompt",
    "inject_context_into_messages",
    "get_openai_tools",
    "execute_tool_call",
]
