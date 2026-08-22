"""Idempotent asset/service/finding upsert + recompute trigger."""
from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Asset, Service, AssetVulnerability, Vulnerability, Connection, Scan, Agent
from app.services.recompute import recompute_org


_CRIT_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}


def ingest(db: Session, org_id: str, agent_id: str, payload: dict) -> dict:
 """
 Idempotent ingest: upsert asset, replace services, upsert findings,
 reconcile stale open findings, trigger recompute.
 """
 # 1. Upsert asset by (org_id, ip)
 ip = payload["ip"]
 hostname = payload.get("hostname", "")
 asset_type = payload.get("asset_type", "unknown")

 asset = db.query(Asset).filter(Asset.org_id == org_id, Asset.ip == ip).first()
 created = False
 if asset is None:
 asset = Asset(
 org_id=org_id,
 ip=ip,
 hostname=hostname,
 asset_type=asset_type,
 criticality=payload.get("criticality", "medium"),
 business_value=float(payload.get("business_value", 10000.0)),
 internet_facing=payload.get("internet_facing", False),
 )
 db.add(asset)
 db.flush()
 created = True
 else:
 # Never downgrade criticality
 new_crit = payload.get("criticality", asset.criticality)
 if _CRIT_RANK.get(new_crit, 0) > _CRIT_RANK.get(asset.criticality, 0):
 asset.criticality = new_crit
 if hostname and not asset.hostname:
 asset.hostname = hostname
 if asset_type != "unknown" and asset.asset_type == "unknown":
 asset.asset_type = asset_type

 # 2. Replace services
 existing_services = db.query(Service).filter(Service.asset_id == asset.id).all()
 existing_keys = {(s.port, s.protocol) for s in existing_services}
 payload_keys = {(s["port"], s.get("protocol", "tcp")) for s in payload.get("services", [])}

 # Remove services not in payload
 for s in existing_services:
 if (s.port, s.protocol) not in payload_keys:
 db.delete(s)

 # Upsert services from payload
 services_upserted = 0
 for s in payload.get("services", []):
 port = s["port"]
 proto = s.get("protocol", "tcp")
 existing = db.query(Service).filter(
 Service.asset_id == asset.id, Service.port == port, Service.protocol == proto
 ).first()
 if existing:
 existing.name = s.get("name", existing.name)
 existing.version = s.get("version", existing.version)
 else:
 db.add(Service(
 org_id=org_id, asset_id=asset.id, port=port, protocol=proto,
 name=s.get("name", ""), version=s.get("version"),
 ))
 services_upserted += 1

 # 3. Upsert findings
 payload_vuln_ids = {v["id"] for v in payload.get("vulnerabilities", [])}
 existing_findings = db.query(AssetVulnerability).filter(
 AssetVulnerability.asset_id == asset.id
 ).all()

 findings_created = 0
 findings_resolved = 0

 for ef in existing_findings:
 if ef.vulnerability_id not in payload_vuln_ids and ef.status in ("open", "remediating"):
 ef.status = "resolved"
 ef.resolved_at = datetime.now(timezone.utc)
 findings_resolved += 1

 for v in payload.get("vulnerabilities", []):
 vuln_id = v["id"]
 # Get or create vulnerability
 vuln = db.query(Vulnerability).filter(Vulnerability.org_id == org_id, Vulnerability.cve_id == vuln_id).first()
 if vuln is None:
 vuln = Vulnerability(
 org_id=org_id,
 cve_id=vuln_id,
 title=v.get("title", ""),
 description=v.get("description"),
 cvss=float(v.get("cvss", 5.0)),
 severity=v.get("severity", "medium"),
 cwe=v.get("cwe"),
 )
 db.add(vuln)
 db.flush()

 # Upsert finding
 finding = db.query(AssetVulnerability).filter(
 AssetVulnerability.asset_id == asset.id,
 AssetVulnerability.vulnerability_id == vuln.id,
 ).first()
 if finding is None:
 finding = AssetVulnerability(
 org_id=org_id,
 asset_id=asset.id,
 vulnerability_id=vuln.id,
 status="open",
 )
 db.add(finding)
 findings_created += 1

 # 4. Upsert connections
 connections_upserted = 0
 for c in payload.get("connectivity", []):
 src = c.get("from", "")
 tgt = c.get("to", "")
 if not src or not tgt:
 continue
 existing_conn = db.query(Connection).filter(
 Connection.org_id == org_id,
 Connection.from_asset_id == src,
 Connection.to_asset_id == tgt,
 Connection.relation == c.get("relation", "network"),
 ).first()
 if existing_conn is None:
 db.add(Connection(
 org_id=org_id,
 from_asset_id=src,
 to_asset_id=tgt,
 relation=c.get("relation", "network"),
 note=c.get("via_service", ""),
 ))
 connections_upserted += 1

 # 5. Record scan
 scan = Scan(org_id=org_id, agent_id=agent_id, asset_count=1, status="complete")
 db.add(scan)

 db.commit()

 # 6. Trigger recompute
 try:
 stats = recompute_org(db, org_id)
 except Exception:
 db.rollback()
 raise

 return {
 "asset_id": asset.id,
 "services_upserted": services_upserted,
 "vulnerabilities_upserted": findings_created,
 "connections_upserted": connections_upserted,
 "findings_created": findings_created,
 "findings_resolved": findings_resolved,
 "recompute_triggered": True,
 }
