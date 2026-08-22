"""Live network watch: device discovery, domain observation, coverage."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models import NetworkDevice, LiveObservation, NetworkCoverage, Asset, AssetVulnerability, Vulnerability
from app.services.live_threats import detect_threats


_90_SECONDS = timedelta(seconds=90)


def observe_devices(db: Session, org_id: str, batch: dict) -> dict:
 """Upsert a device batch from the edge agent."""
 devices_data = batch.get("devices", [])
 label = batch.get("label", "")
 gateway_ip = batch.get("gateway_ip")
 self_mac = batch.get("self_mac")
 active_subnets = set(batch.get("active_subnets", []))

 now = datetime.now(timezone.utc)
 seen_macs: set[str] = set()
 seen_subnet_ips: dict[str, set[str]] = {} # subnet -> set of IPs

 upserted = 0

 for d in devices_data:
 mac = d.get("mac")
 ip = d["ip"]
 subnet = d.get("subnet", "")
 hostname = d.get("hostname", "")
 vendor = d.get("vendor", "")
 is_gateway = (ip == gateway_ip)
 is_self = (mac == self_mac)
 discovery = d.get("discovery", "arp" if mac else "l3")

 existing = None
 if mac:
 existing = db.query(NetworkDevice).filter(
 NetworkDevice.org_id == org_id, NetworkDevice.mac == mac
 ).first()
 if not existing and subnet:
 existing = db.query(NetworkDevice).filter(
 NetworkDevice.org_id == org_id,
 NetworkDevice.subnet == subnet,
 NetworkDevice.ip == ip,
 ).first()

 if existing:
 existing.last_seen = now
 existing.online = True
 existing.subnet = subnet
 if hostname:
 existing.hostname = hostname
 if not existing.label:
 existing.label = label
 if mac and not existing.mac:
 existing.mac = mac
 if not existing.vendor:
 existing.vendor = vendor
 existing.is_gateway = is_gateway or existing.is_gateway
 existing.is_self = is_self or existing.is_self
 else:
 device = NetworkDevice(
 org_id=org_id,
 mac=mac,
 ip=ip,
 subnet=subnet,
 subnet_inferred=not bool(subnet),
 source_agent_id=batch.get("agent_id", ""),
 label=label,
 discovery=discovery,
 hostname=hostname,
 vendor=vendor,
 is_self=is_self,
 is_gateway=is_gateway,
 online=True,
 last_seen=now,
 )
 db.add(device)
 upserted += 1

 # Track for pruning
 if mac:
 seen_macs.add(mac)
 if subnet:
 seen_subnet_ips.setdefault(subnet, set()).add(ip)

 # Prune stale devices ONLY within observed subnets
 cutoff = now - _90_SECONDS
 stale = db.query(NetworkDevice).filter(
 NetworkDevice.org_id == org_id,
 NetworkDevice.last_seen < cutoff,
 ).all()
 pruned = 0
 for d in stale:
 if d.subnet and d.subnet in active_subnets:
 if not d.mac or d.mac not in seen_macs:
 if d.ip not in seen_subnet_ips.get(d.subnet, set()):
 d.online = False
 pruned += 1
 elif d.subnet and d.subnet not in active_subnets:
 d.online = False
 pruned += 1

 # Update coverage
 _update_coverage(db, org_id, active_subnets, gateway_ip)

 db.commit()
 return {"upserted": upserted, "pruned": pruned}


def _update_coverage(db: Session, org_id: str, subnets: set[str], gateway_ip: str | None):
 for subnet in subnets:
 existing = db.query(NetworkCoverage).filter(
 NetworkCoverage.org_id == org_id, NetworkCoverage.subnet == subnet
 ).first()
 if existing is None:
 db.add(NetworkCoverage(
 org_id=org_id,
 subnet=subnet,
 gateway_ip=gateway_ip or "",
 status="reachable_not_scanned",
 evidence="Agent-reported active subnet",
 device_count=0,
 ))


def observe(db: Session, org_id: str, domain: str, url: str, source_host: str | None = None) -> LiveObservation:
 """Observe a domain — run URL trust analysis and upsert."""
 from app.services.urltrust.analyzer import analyze_url

 result = analyze_url(url)
 band = result.get("band", "Caution")
 score = float(result.get("score", 50.0))

 existing = db.query(LiveObservation).filter(
 LiveObservation.org_id == org_id, LiveObservation.domain == domain
 ).first()
 now = datetime.now(timezone.utc)
 if existing:
 existing.band = band
 existing.score = score
 existing.verdict_json = result
 existing.hit_count += 1
 existing.last_seen = now
 else:
 obs = LiveObservation(
 org_id=org_id,
 domain=domain,
 url=url,
 band=band,
 score=score,
 verdict_json=result,
 source_host=source_host,
 )
 db.add(obs)
 existing = obs
 db.commit()
 return existing


def list_devices(db: Session, org_id: str) -> list[NetworkDevice]:
 return db.query(NetworkDevice).filter(NetworkDevice.org_id == org_id).order_by(NetworkDevice.last_seen.desc()).all()


def list_threats(db: Session, org_id: str) -> list:
 devices = list_devices(db, org_id)
 doms = db.query(LiveObservation).filter(LiveObservation.org_id == org_id).all()
 return detect_threats(devices, doms)


def list_coverage(db: Session, org_id: str) -> list[NetworkCoverage]:
 return db.query(NetworkCoverage).filter(NetworkCoverage.org_id == org_id).all()
