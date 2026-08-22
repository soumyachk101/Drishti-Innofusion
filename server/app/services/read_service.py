"""Read-optimized graph builder for React Flow."""
from __future__ import annotations

from sqlalchemy.orm import Session
from app.models import Asset, AssetVulnerability, Vulnerability, Connection, NetworkDevice, DeepScan, LiveObservation, RiskZone
from app.services.graph_layout import layout_nodes
from app.services.risk_engine import NodeData, build_engine
from app.services.attack_paths import enumerate_paths
from app.services.live_threats import detect_threats


def build_graph(db: Session, org_id: str) -> dict:
 assets = db.query(Asset).filter(Asset.org_id == org_id).all()
 connections = db.query(Connection).filter(Connection.org_id == org_id).all()
 zones = db.query(RiskZone).filter(RiskZone.org_id == org_id).all()

 # Build findings map for engine
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
 paths = enumerate_paths(G, nodes)

 # Build path annotations for edges
 top_path_ids = {p.path_id for p in paths[:10]}
 edge_annotations = {}
 for p in paths[:10]:
 for i in range(len(p.hops) - 1):
 key = (p.hops[i], p.hops[i + 1])
 edge_annotations[key] = {"onTopPath": True, "path_id": p.path_id}

 # Layout
 positions = layout_nodes(assets, zones)

 zone_map = {z.id: z for z in zones}

 # Build nodes for React Flow
 rfnodes = []
 rfnodes.append({
 "id": "INTERNET",
 "type": "gateway",
 "position": {"x": 20, "y": 300},
 "data": {"label": "INTERNET", "ip": "", "zone": "", "risk_score": 0.0, "asset_type": "gateway", "criticality": "", "is_crown_jewel": False, "services": [], "blast_radius_count": 0, "downstream_value_usd": 0.0},
 })

 for asset in assets:
 pos = positions.get(asset.id, {"x": 300, "y": 300})
 nd = nodes.get(asset.id)
 risk = nd.max_exploitability * 100 if nd else 0.0
 zone_kind = zone_map[asset.zone_id].kind if asset.zone_id and asset.zone_id in zone_map else ""

 # Services
 svc_list = []
 for s in asset.services:
 svc_list.append({"port": s.port, "protocol": s.protocol, "name": s.name, "version": s.version})

 # Findings
 f_list = []
 for f, v in findings:
 if f.asset_id == asset.id:
 f_list.append({
 "id": f.id, "cve_id": v.cve_id or "", "title": v.title,
 "severity": v.severity, "cvss": float(v.cvss or 0), "port": None,
 "service_name": "", "status": f.status,
 })

 node_data = {
 "label": asset.hostname or asset.ip,
 "ip": asset.ip,
 "hostname": asset.hostname or "",
 "zone": zone_kind,
 "risk_score": round(risk, 3),
 "asset_type": asset.asset_type,
 "criticality": asset.criticality,
 "is_crown_jewel": nd.is_crown_jewel if nd else False,
 "services": svc_list,
 "blast_radius_count": blast_radius(G, asset.id) if G.has_node(asset.id) else 0,
 "downstream_value_usd": 0.0,
 }
 rfnodes.append({
 "id": asset.id,
 "type": "asset",
 "position": pos,
 "data": node_data,
 })

 # Build edges
 rfedges = []
 for conn in connections:
 src_pos = positions.get(conn.from_asset_id)
 tgt_pos = positions.get(conn.to_asset_id)
 if not src_pos or not tgt_pos:
 continue
 ann = edge_annotations.get((conn.from_asset_id, conn.to_asset_id), {})
 rfedges.append({
 "id": f"e-{conn.from_asset_id}-{conn.to_asset_id}-{conn.relation}",
 "source": conn.from_asset_id,
 "target": conn.to_asset_id,
 "label": conn.note or "",
 "style": {
 "stroke": _edge_color(conn.relation),
 "strokeWidth": 2 if ann.get("onTopPath") else 1,
 },
 "data": {
 "relation": conn.relation,
 "weight": float(conn.weight) if conn.weight else 0.0,
 "onTopPath": ann.get("onTopPath", False),
 "path_id": ann.get("path_id"),
 },
 })

 # Live devices
 devices = db.query(NetworkDevice).filter(NetworkDevice.org_id == org_id, NetworkDevice.online == True).all()
 device_nodes = []
 for d in devices:
 device_nodes.append({
 "id": f"dev-{d.id}",
 "type": "device",
 "position": {"x": float(d.id.__hash__() % 500), "y": float((d.id.__hash__() // 500) % 400)},
 "data": {
 "label": d.hostname or d.ip,
 "ip": d.ip,
 "hostname": d.hostname or "",
 "zone": "",
 "risk_score": 0.0,
 "asset_type": "device",
 "criticality": "",
 "is_crown_jewel": False,
 "services": [],
 "blast_radius_count": 0,
 "downstream_value_usd": 0.0,
 },
 })

 # Threats
 from app.models import LiveObservation
 doms = db.query(LiveObservation).filter(LiveObservation.org_id == org_id).all()
 devices_for_threats = devices + [None] # placeholder
 threats = detect_threats(devices, doms, None)
 threat_nodes = []
 for t in threats:
 threat_nodes.append({
 "id": f"threat-{t.device}",
 "type": "threat",
 "position": {"x": 600, "y": 100},
 "data": {
 "label": t.title,
 "ip": "",
 "hostname": "",
 "zone": "",
 "risk_score": 0.0,
 "asset_type": "threat",
 "criticality": t.severity,
 "is_crown_jewel": False,
 "services": [],
 "blast_radius_count": 0,
 "downstream_value_usd": 0.0,
 "threat": {"kind": t.kind, "severity": t.severity, "mitre": t.mitre, "recommendation": t.recommendation},
 },
 })

 zones_out = []
 for z in zones:
 count = sum(1 for a in assets if a.zone_id == z.id)
 zones_out.append({"zone": z.name, "kind": z.kind, "count": count})

 return {
 "nodes": rfnodes + device_nodes + threat_nodes,
 "edges": rfedges,
 "zones": zones_out,
 "live_devices": devices,
 "network_threats": threats,
 }


def _edge_color(relation: str) -> str:
 colors = {"network": "#3b82f6", "admin": "#f59e0b", "trust": "#8b5cf6", "exposure": "#ef4444"}
 return colors.get(relation, "#6b7280")
