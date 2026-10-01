"""
Zero-dependency Ollama AI Provider for RecallDB.
Communicates directly with local Ollama daemon via standard HTTP API.
"""

import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from recalldb.ai.base import BaseAIProvider, AIResponse


class OllamaProvider(BaseAIProvider):
    """
    Ollama local edge AI provider.
    Zero external dependencies; uses Python standard library urllib.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        default_model: str = "minicpm-v4.6:latest",
        timeout: float = 60.0
    ):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = timeout

    def is_available(self) -> bool:
        """Check if local Ollama daemon is running."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                return resp.status == 200
        except Exception:
            return False

    def list_models(self) -> List[str]:
        """List locally installed Ollama models."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return [m.get("name") for m in data.get("models", []) if m.get("name")]
        except Exception:
            return []

    def chat(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        **kwargs
    ) -> AIResponse:
        """Execute chat completion with Ollama."""
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                **kwargs.get("options", {})
            }
        }

        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data.get("message", {}).get("content", "").strip()
                prompt_eval_count = data.get("prompt_eval_count")
                eval_count = data.get("eval_count")
                return AIResponse(
                    content=content,
                    model=target_model,
                    provider="ollama",
                    raw_response=data,
                    prompt_tokens=prompt_eval_count,
                    completion_tokens=eval_count
                )
        except urllib.error.URLError as e:
            raise ConnectionError(
                f"Failed to communicate with Ollama at '{self.base_url}'. "
                f"Ensure Ollama is running (`ollama serve`). Error: {e}"
            )
