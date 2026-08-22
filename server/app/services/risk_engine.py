from __future__ import annotations
from dataclasses import dataclass, field
import networkx as nx
import numpy as np

from app.models import Asset, AssetVulnerability, Vulnerability, Connection


# --- Config ---
class RiskConfig:
 expose_reach_weight: float = 0.25
 centrality_weight: float = 0.20
 value_weight: float = 0.15
 criticality_weight: float = 0.10
 ease_exploit: float = 0.6
 ease_severity: float = 0.4
 relation_base: dict[str, float] = field(default_factory=lambda: {
 "exposure": 0.1, "network": 0.2, "trust": 0.25, "admin": 0.15,
 })
 relation_ease: dict[str, float] = field(default_factory=lambda: {
 "exposure": 0.5, "network": 0.4, "trust": 0.45, "admin": 0.5,
 })
 crit_factor: dict[str, float] = field(default_factory=lambda: {
 "low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0,
 })

cfg = RiskConfig()


# --- Data classes ---
@dataclass
class NodeData:
 asset_id: str
 asset_type: str
 criticality: str
 business_value: float
 internet_facing: bool
 is_crown_jewel: bool
 max_exploitability: float = 0.0
 max_cvss: float = 0.0
 vuln_count: int = 0


@dataclass
class EdgeData:
 relation: str
 weight: float = 0.0


def _clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
 return max(lo, min(hi, v))


def ease_of_compromise(node: NodeData) -> float:
 dest_exploit = node.max_exploitability
 dest_sev = node.max_cvss / 10.0
 return _clamp(cfg.ease_exploit * dest_exploit + cfg.ease_severity * dest_sev)


def compute_edge_weight(u: NodeData, v: NodeData, relation: str) -> float:
 e = ease_of_compromise(v)
 base = cfg.relation_base.get(relation, 0.2)
 return base + (1.0 - e)


def compute_node_scores(G: nx.DiGraph, nodes: dict[str, NodeData]) -> dict[str, float]:
 # 1. Normalize business value
 values = np.array([n.business_value for n in nodes.values()], dtype=float)
 vmin, vmax = values.min(), values.max()
 val_norm = (values - vmin) / (vmax - vmin + 1e-9)

 # 2. Dijkstra shortest paths from INTERNET
 try:
 lengths = nx.single_source_dijkstra_path_length(G, "INTERNET")
 reach = {}
 for nid in nodes:
 d = lengths.get(nid, float("inf"))
 reach[nid] = 1.0 / (1.0 + d) if d != float("inf") else 0.0
 except Exception:
 reach = {nid: 0.0 for nid in nodes}

 # 3. Betweenness centrality
 try:
 bc = nx.betweenness_centrality(G, weight="weight", normalized=True)
 bc_max = max(bc.values()) if bc else 1.0
 except Exception:
 bc = {nid: 0.0 for nid in nodes}
 bc_max = 1.0

 scores = {}
 for i, (nid, nd) in enumerate(nodes.items()):
 exploit = ease_of_compromise(nd)
 r = max(reach.get(nid, 0.0), 0.5 if reach.get(nid, 0.0) > 0 else 0.0)
 cent = bc.get(nid, 0.0) / (bc_max + 1e-9)
 crit = cfg.crit_factor.get(nd.criticality, 0.25)

 score = 100.0 * (
 cfg.expose_reach_weight * exploit
 + cfg.centrality_weight * cent
 + cfg.value_weight * val_norm[i]
 + cfg.criticality_weight * crit
 )
 scores[nid] = _clamp(score, 0.0, 100.0)

 return scores


def blast_radius(G: nx.DiGraph, node_id: str) -> int:
 descendants = nx.descendants(G, node_id)
 return len(descendants)


def blast_radius_value(G: nx.DiGraph, node_id: str, nodes: dict[str, NodeData]) -> float:
 return sum(
 nodes.get(d, NodeData("", "", "low", 0.0, False, False)).business_value
 for d in nx.descendants(G, node_id)
 )


def is_crown_jewel(nd: NodeData, zone_kind: str | None = None) -> bool:
 if zone_kind == "crown_jewel":
 return True
 if nd.criticality == "critical":
 return True
 return False


def build_engine(org_id: str, assets: list[Asset], connections: list[Connection],
 findings_map: dict[str, list[tuple[AssetVulnerability, Vulnerability]]]) -> tuple[nx.DiGraph, dict[str, NodeData]]:
 G = nx.DiGraph()
 G.add_node("INTERNET", _data=NodeData("INTERNET", "", "low", 0.0, False, False))

 nodes: dict[str, NodeData] = {}

 # Create asset nodes
 for asset in assets:
 findings = findings_map.get(asset.id, [])
 max_exploit = 0.0
 max_cvss = 0.0
 for f, v in findings:
 if f.status in ("open", "remediating"):
 exp = float(v.cvss or 0) / 10.0
 max_exploit = max(max_exploit, exp)
 max_cvss = max(max_cvss, float(v.cvss or 0))

 nd = NodeData(
 asset_id=asset.id,
 asset_type=asset.asset_type,
 criticality=asset.criticality,
 business_value=float(asset.business_value),
 internet_facing=asset.internet_facing,
 is_crown_jewel=asset.zone and asset.zone.kind == "crown_jewel" or asset.criticality == "critical",
 max_exploitability=max_exploit,
 max_cvss=max_cvss,
 vuln_count=len(findings),
 )
 nodes[asset.id] = nd
 G.add_node(asset.id, _data=nd)

 # Exposure edges from INTERNET
 for nid, nd in nodes.items():
 if nd.internet_facing:
 w = compute_edge_weight(nodes["INTERNET"], nd, "exposure")
 G.add_edge("INTERNET", nid, weight=w, relation="exposure")

 # Declared connections
 for conn in connections:
 if conn.from_asset_id in nodes and conn.to_asset_id in nodes:
 src = nodes[conn.from_asset_id]
 dst = nodes[conn.to_asset_id]
 w = compute_edge_weight(src, dst, conn.relation)
 G.add_edge(conn.from_asset_id, conn.to_asset_id, weight=w, relation=conn.relation)

 return G, nodes
