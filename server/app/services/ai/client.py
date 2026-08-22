"""LLM provider abstraction — NVIDIA NIM (default), Groq, Anthropic."""
from __future__ import annotations

import json
import time
import httpx
from app.config import settings

_AI_STATS = {"calls": 0, "mock_calls": 0, "fallbacks": 0, "latency_ms": []}


def _get_provider() -> str:
 return settings.ai_provider


def generate(system: str, user_prompt: str, mock_key: str = "", fallback: str | None = None, schema: dict | None = None) -> dict:
 """Call LLM or return mock. Never raises — always returns a dict."""
 provider = _get_provider()

 if settings.ai_mock or (provider == "nvidia" and not settings.nvidia_api_key) or (provider == "groq" and not settings.groq_api_key):
 _AI_STATS["mock_calls"] += 1
 return {"refused": False, "mock": True, **(json.loads(fallback) if fallback else {})}

 try:
 t0 = time.time()
 if provider == "nvidia":
 result = _call_nvidia(system, user_prompt, schema)
 elif provider == "groq":
 result = _call_groq(system, user_prompt, schema)
 elif provider == "anthropic":
 result = _call_anthropic(system, user_prompt, schema)
 else:
 raise ValueError(f"Unknown provider: {provider}")

 latency = (time.time() - t0) * 1000
 _AI_STATS["calls"] += 1
 _AI_STATS["latency_ms"].append(latency)
 return result
 except Exception:
 _AI_STATS["fallbacks"] += 1
 if fallback:
 try:
 return json.loads(fallback)
 except Exception:
 pass
 return {"refused": False}


def _call_nvidia(system: str, user_prompt: str, schema: dict | None = None) -> dict:
 if not settings.nvidia_api_key:
 return {"refused": False}

 url = settings.nvidia_base_url or "https://integrate.api.nvidia.com/v1"
 model = settings.ai_model or "meta/llama-3.3-70b-instruct"

 messages = [{"role": "system", "content": system}, {"role": "user", "content": user_prompt}]
 payload = {
 "model": model,
 "messages": messages,
 "temperature": 0.2,
 "max_tokens": settings.ai_max_tokens,
 }

 if schema:
 payload["response_format"] = {"type": "json_object"}

 headers = {
 "Authorization": f"Bearer {settings.nvidia_api_key}",
 "Content-Type": "application/json",
 }

 with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
 resp = client.post(f"{url}/chat/completions", json=payload, headers=headers)
 resp.raise_for_status()
 data = resp.json()
 text = data["choices"][0]["message"]["content"]
 return _extract_json(text)


def _call_groq(system: str, user_prompt: str, schema: dict | None = None) -> dict:
 if not settings.groq_api_key:
 return {"refused": False}

 url = "https://api.groq.com/openai/v1/chat/completions"
 model = settings.ai_model or "llama-3.1-8b-instant"
 messages = [{"role": "system", "content": system}, {"role": "user", "content": user_prompt}]
 payload = {
 "model": model,
 "messages": messages,
 "temperature": 0.2,
 "max_tokens": settings.ai_max_tokens,
 }
 if schema:
 payload["response_format"] = {"type": "json_object"}

 headers = {"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"}
 with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
 resp = client.post(url, json=payload, headers=headers)
 resp.raise_for_status()
 data = resp.json()
 text = data["choices"][0]["message"]["content"]
 return _extract_json(text)


def _call_anthropic(system: str, user_prompt: str, schema: dict | None = None) -> dict:
 if not settings.anthropic_api_key:
 return {"refused": False}

 url = "https://api.anthropic.com/v1/messages"
 model = settings.ai_model or "claude-sonnet-5"
 payload = {
 "model": model,
 "max_tokens": settings.ai_max_tokens,
 "system": system,
 "messages": [{"role": "user", "content": user_prompt}],
 "temperature": 0.2,
 }
 if schema:
 payload["response_format"] = {"type": "json_object"}

 headers = {
 "x-api-key": settings.anthropic_api_key,
 "anthropic-version": "2023-06-01",
 "Content-Type": "application/json",
 }
 with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
 resp = client.post(url, json=payload, headers=headers)
 resp.raise_for_status()
 data = resp.json()
 text = data["content"][0]["text"]
 return _extract_json(text)


def _extract_json(text: str) -> dict:
 """Strip markdown fences and parse JSON."""
 text = text.strip()
 if text.startswith("```"):
 text = text.split("\n", 1)[1] if "\n" in text else text[3:]
 if text.endswith("```"):
 text = text[:-3]
 try:
 return json.loads(text.strip())
 except json.JSONDecodeError:
 # Try to find JSON object in text
 start = text.find("{")
 end = text.rfind("}") + 1
 if start >= 0 and end > start:
 try:
 return json.loads(text[start:end])
 except Exception:
 pass
 return {"refused": False}


def get_stats() -> dict:
 return dict(_AI_STATS)
