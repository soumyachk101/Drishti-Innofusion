"""Background Telegram notification dispatcher."""
from __future__ import annotations

import threading
import time
import urllib.request
import urllib.parse
import json
from datetime import datetime, timezone, timedelta

from app.config import settings
from app.core.errors import DrishtiError


_alerted: set[str] = set()
_running = False


def start_dispatcher(db_factory):
 global _running
 _running = True

 def _loop():
 while _running:
 try:
 with db_factory() as db:
 _scan(db)
 except Exception:
 pass
 time.sleep(30)

 t = threading.Thread(target=_loop, daemon=True)
 t.start()


def _scan(db):
 from app.models import AssetVulnerability, Vulnerability, NetworkDevice
 from app.services.live_threats import detect_threats
 from app.services.live import list_threats

 now = datetime.now(timezone.utc)

 # High/critical findings
 findings = db.query(AssetVulnerability).filter(
 AssetVulnerability.status == "open",
 ).all()
 for f in findings:
 if not f.vulnerability:
 continue
 sev = f.vulnerability.severity
 if sev in ("high", "critical"):
 key = f"finding:{f.id}"
 if key not in _alerted:
 _alerted.add(key)
 _send(f"⚠️ {sev.upper()}: {f.vulnerability.title} on {f.asset_id}")

 # Threats
 devices = db.query(NetworkDevice).filter(NetworkDevice.online == True).all()
 from app.models import LiveObservation
 doms = db.query(LiveObservation).all()
 threats = detect_threats(devices, doms, now=now)
 for t in threats:
 key = f"threat:{t.kind}:{t.device or ''}"
 if key not in _alerted:
 _alerted.add(key)
 _send(f"🚨 {t.kind}: {t.title}")


def _send(text: str):
 if not settings.telegram_bot_token or not settings.telegram_chat_id:
 return
 try:
 url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
 data = json.dumps({"chat_id": settings.telegram_chat_id, "text": text, "parse_mode": "Markdown"}).encode()
 req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
 urllib.request.urlopen(req, timeout=10)
 except Exception:
 pass
