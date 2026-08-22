"""Per-org scheduled deep-scan."""
from __future__ import annotations

import asyncio
import threading
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import AutoScanConfig, NetworkDevice
from app.config import settings
from app.services.live_threats import detect_threats


_running = False


def start_scheduler(db_factory, skip_test: bool = False):
 """Start the autoscan background loop."""
 global _running
 if skip_test:
 return
 _running = True

 def _loop():
 while _running:
 try:
 with db_factory() as db:
 _tick(db)
 except Exception:
 pass
 asyncio.sleep(20)

 t = threading.Thread(target=_loop, daemon=True)
 t.start()


async def asyncio_sleep(seconds: float):
 await asyncio.sleep(seconds)


def _tick(db: Session):
 now = datetime.now(timezone.utc)
 configs = db.query(AutoScanConfig).filter(AutoScanConfig.enabled == True).all()

 for cfg in configs:
 if cfg.last_run_at and (now - cfg.last_run_at).total_seconds() < cfg.interval_seconds:
 continue

 # Find next device to scan
 devices = db.query(NetworkDevice).filter(
 NetworkDevice.org_id == cfg.org_id,
 NetworkDevice.online == True,
 ).all()
 if not devices:
 continue

 cursor = cfg.cursor % len(devices)
 device = devices[cursor]
 cfg.cursor = (cursor + 1) % len(devices)
 cfg.last_run_at = now
 db.commit()

 # TODO: trigger deep scan for device.ip (consent-gated)
