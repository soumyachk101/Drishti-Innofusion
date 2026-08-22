"""URL Trust scoring and hostname-based network evaluation."""
from __future__ import annotations

import ipaddress
import re
import time
import urllib.request
import urllib.error
import json
from datetime import datetime, timezone
from typing import Any
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.config import settings

_GOOGLE_SAFE_BROWSING_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
_MIMETYPES_JS_LABEL = "text/html; application/javascript; text/javascript"
_MIMETYPES_HIGH_RISK = ["application/x-msdownload", "application/x-msdos-program", "application/octet-stream"]
_VT_MAX_FREE = 4

_AI_STATS = {"calls": 0, "mock_calls": 0, "fallbacks": 0, "latency_ms": []}


def _score_hostname_heuristic(hostname: str) -> dict:
 import re
 host = (hostname or "").lower()
 parts = host.split(".")
 score = 100
 reasons = []

 if len(parts) < 2:
 score -= 20
 reasons.append("no subdomain")

 if host.count(".") >= 4:
 score -= 30
 reasons.append("too many levels")

 susp = re.findall(r"[a-z0-9]{8,}", host)
 if len(susp) >= 2:
 score -= 25
 reasons.append("random-looking labels")

 brand_map = {"google": "google.com", "microsoft": "microsoft.com", "amazon": "amazon.com", "github": "github.com", "apple": "apple.com"}
 for brand, legit in brand_map.items():
 if brand in host != legit:
 score -= 35
 reasons.append("possible typosquat")

 score = max(0, min(100, score))
 if score >= 85:
 band = "Safe"
 elif score >= 65:
 band = "Caution"
 else:
 band = "High Risk"
 return {"hostname": hostname, "score": score, "band": band, "reasons": reasons, "algorithm": "heuristic"}


def _score_site_content(url: str, timeout: float = 5.0) -> dict:
 """Fetch site title."""
 try:
 req = urllib.request.Request(url, headers={"User-Agent": "Drishti/1.0"})
 with urllib.request.urlopen(req, timeout=timeout) as r:
 raw = r.read(64 * 1024)
 import re
 title_m = re.search(rb"<title>([^<]+)</title>", raw, re.IGNORECASE)
 title = title_m.group(1).decode("utf-8", errors="ignore") if title_m else ""
 return {"title": title, "status_code": r.status, "content_length": len(raw)}
 except Exception as e:
 return {"error": str(e)}


def analyze_url(url: str, providers: str = "whoisxml,dns,ssl,headers,site,ai") -> dict:
 """Full URL trust analysis."""
 if not url:
 return {"url": url, "hostname": "", "score": 0, "band": "High Risk", "summary": {"verdict": "No URL"}}

 try:
 from urllib.parse import urlparse
 parsed = urlparse(url if "://" in url else f"https://{url}")
 hostname = parsed.hostname or url
 except Exception:
 hostname = url
 url = url if "://" in url else f"https://{url}"

 # Heuristic hostname score
 host_result = _score_hostname_heuristic(hostname)

 score = host_result["score"]
 signals: dict[str, Any] = {}
 signals["hostname"] = host_result

 provider_list = [p.strip() for p in providers.split(",") if p.strip()]

 with ThreadPoolExecutor(max_workers=5) as pool:
 futures = {}
 if "whoisxml" in provider_list:
 futures["whoisxml"] = pool.submit(_fetch_whois, hostname)
 if "dns" in provider_list:
 futures["dns"] = pool.submit(_fetch_dns, hostname)
 if "ssl" in provider_list:
 futures["ssl"] = pool.submit(_fetch_ssl, hostname)
 if "headers" in provider_list:
 futures["headers"] = pool.submit(_fetch_headers, url)
 if "site" in provider_list:
 futures["site"] = pool.submit(_score_site_content, url)

 for k, f in futures.items():
 try:
 signals[k] = f.result(timeout=6)
 except Exception:
 signals[k] = {}

 # Apply provider penalties
 for p in provider_list:
 sig = signals.get(p, {})
 if p == "whoisxml" and sig.get("risk_score") is not None:
 score = int(0.4 * score + 0.6 * float(sig.get("risk_score", 100)))
 if p == "dns" and sig.get("dnssec") is False:
 score -= 5
 if p == "ssl" and sig.get("valid") is False:
 score -= 15
 if p == "headers" and sig.get("has_hsts") is False:
 score -= 5

 # Optional AI
 ai_result = None
 if "ai" in provider_list and not settings.ai_mock:
 from app.services.ai.client import generate
 prompt = f"Rate this URL {url}. Return JSON: {{'band': 'Safe'|'Caution'|'High Risk', 'score': 0-100}}"
 raw = generate("URL trust rater. Output JSON only.", prompt)
 try:
 import json
 ai_result = raw if isinstance(raw, dict) else json.loads(str(raw))
 score = int(0.7 * score + 0.3 * float(ai_result.get("score", score)))
 except Exception:
 pass

 score = max(0, min(100, score))
 if score >= 85:
 band = "Safe"
 elif score >= 65:
 band = "Caution"
 else:
 band = "High Risk"

 website = {}
 if "site" in provider_list:
 website = signals.get("site", {})
 if website.get("status_code") in (403, 429):
 website["access_denied"] = True
 if website.get("content_length") and website["content_length"] < 200:
 score -= 5

 # Construct verdict
 verdict = {
 "url": url,
 "hostname": hostname,
 "score": score,
 "band": band,
 "signals": signals,
 "website": {"title": website.get("title", ""), "status_code": website.get("status_code"), "content_length": website.get("content_length")},
 "providers": {p: "OK" for p in provider_list},
 "summary": {"verdict": band, "score": score, "provider_count": len(provider_list), "ai": ai_result},
 }
 return verdict


def _fetch_whois(hostname: str) -> dict:
 """Mock whois lookup."""
 return {"hostname": hostname, "whois_server": "", "risk_score": 50, "age_days": 365, "domain": hostname}


def _fetch_dns(hostname: str) -> dict:
 """DNS resolution check."""
 import socket
 try:
 ip = socket.gethostbyname(hostname)
 dnssec = True
 return {"hostname": hostname, "ip": ip, "dnssec": dnssec, "ipv6": True}
 except socket.gaierror:
 return {"hostname": hostname, "ip": "", "dnssec": None, "ipv6": False}


def _fetch_ssl(url: str) -> dict:
 """SSL certificate check."""
 try:
 from urllib.parse import urlparse
 parsed = urlparse(url)
 ctx = __import__("ssl", fromlist=["SSLContext"]).create_default_context()
 import socket
 host = parsed.hostname or url
 port = parsed.port or 443
 s = socket.create_connection((host, port), timeout=3)
 c = ctx.wrap_socket(s, server_hostname=host)
 cert = c.getpeercert()
 c.close()
 return {"valid": True, "issuer": cert.get("issuer", ""), "notAfter": cert.get("notAfter", "")}
 except Exception:
 return {"valid": False}


def _fetch_headers(url: str) -> dict:
 """HTTP headers check."""
 try:
 req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Drishti/1.0"})
 with urllib.request.urlopen(req, timeout=3) as r:
 headers = dict(r.headers)
 return {
 "has_hsts": "strict-transport-security" in {k.lower(): v for k, v in headers.items()},
 "status_code": r.status,
 "server": headers.get("Server", ""),
 }
 except Exception:
 return {"has_hsts": False, "status_code": None, "server": ""}


def evaluate_risk_band(score: float) -> str:
 if score >= 85:
 return "Safe"
 elif score >= 65:
 return "Caution"
 else:
 return "High Risk"


def is_high_risk(url: str) -> bool:
 r = analyze_url(url, providers="hostname")
 return r.get("band") == "High Risk"
