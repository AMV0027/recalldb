"""
Zero-dependency OpenAI-Compatible AI Provider for RecallDB.
Compatible with OpenAI, DeepSeek, Groq, OpenRouter, Together AI, vLLM, and LM Studio.
"""

import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from recalldb.ai.base import BaseAIProvider, AIResponse


class OpenAIProvider(BaseAIProvider):
    """
    OpenAI-compatible AI Provider.
    Zero external dependencies; uses Python standard library urllib.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.openai.com/v1",
        default_model: str = "gpt-4o",
        timeout: float = 60.0
    ):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = timeout

    def chat(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        **kwargs
    ) -> AIResponse:
        """Execute chat completion with OpenAI-compatible endpoint."""
        target_model = model or self.default_model

        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            **kwargs
        }

        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choices = data.get("choices", [])
                content = choices[0].get("message", {}).get("content", "").strip() if choices else ""
                usage = data.get("usage", {})
                return AIResponse(
                    content=content,
                    model=target_model,
                    provider="openai",
                    raw_response=data,
                    prompt_tokens=usage.get("prompt_tokens"),
                    completion_tokens=usage.get("completion_tokens")
                )
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise ConnectionError(f"OpenAI API error ({e.code}): {err_body}")
        except urllib.error.URLError as e:
            raise ConnectionError(f"Failed to connect to OpenAI endpoint '{self.base_url}': {e}")
