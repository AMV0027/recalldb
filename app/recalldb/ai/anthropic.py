"""
Zero-dependency Anthropic Claude Provider for RecallDB.
Communicates directly with the Anthropic Messages API.
"""

import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from recalldb.ai.base import BaseAIProvider, AIResponse


class AnthropicProvider(BaseAIProvider):
    """
    Anthropic Claude AI Provider.
    Zero external dependencies; uses Python standard library urllib.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.anthropic.com/v1",
        default_model: str = "claude-3-5-sonnet-20241022",
        timeout: float = 60.0
    ):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = timeout

    def chat(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
        **kwargs
    ) -> AIResponse:
        """Execute chat completion with Anthropic Messages API."""
        if not self.api_key:
            raise ValueError("Anthropic API key required. Set ANTHROPIC_API_KEY or pass api_key.")

        target_model = model or self.default_model

        # Extract system prompt if present in messages
        system_content = None
        user_messages = []
        for m in messages:
            if m.get("role") == "system":
                system_content = m.get("content", "")
            else:
                user_messages.append({"role": m.get("role"), "content": m.get("content")})

        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }

        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": user_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if system_content:
            payload["system"] = system_content

        req = urllib.request.Request(
            f"{self.base_url}/messages",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                contents = data.get("content", [])
                text_parts = [p.get("text", "") for p in contents if p.get("type") == "text"]
                content = "".join(text_parts).strip()
                usage = data.get("usage", {})
                return AIResponse(
                    content=content,
                    model=target_model,
                    provider="anthropic",
                    raw_response=data,
                    prompt_tokens=usage.get("input_tokens"),
                    completion_tokens=usage.get("output_tokens")
                )
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise ConnectionError(f"Anthropic API error ({e.code}): {err_body}")
        except urllib.error.URLError as e:
            raise ConnectionError(f"Failed to connect to Anthropic endpoint '{self.base_url}': {e}")
