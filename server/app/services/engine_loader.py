from __future__ import annotations
from sqlalchemy.orm import Session

from app.models import Asset, Connection, AssetVulnerability, Vulnerability
from app.services.risk_engine import build_engine, NodeData
from app.services.attack_paths import enumerate_paths


def load_engine(db: Session, org_id: str):
 from app.services.risk_engine import RiskConfig
 cfg = RiskConfig()

 # Load assets
 assets = db.query(Asset).filter(Asset.org_id == org_id).all()

 # Load connections
 connections = db.query(Connection).filter(Connection.org_id == org_id).all()

 # Load open/remediating findings with vulnerabilities
 findings = (
 db.query(AssetVulnerability, Vulnerability)
 .join(Vulnerability, AssetVulnerability.vulnerability_id == Vulnerability.id)
 .filter(AssetVulnerability.org_id == org_id)
 .filter(AssetVulnerability.status.in_(["open", "remediating"]))
 .all()
 )

 findings_map: dict[str, list] = {}
 for f, v in findings:
 findings_map.setdefault(f.asset_id, []).append((f, v))

 G, nodes = build_engine(org_id, assets, connections, findings_map)
 return G, nodes, findings_map


def get_engine_data(db: Session, org_id: str):
 G, nodes, findings_map = load_engine(db, org_id)
 paths = enumerate_paths(G, nodes)
 return G, nodes, paths
