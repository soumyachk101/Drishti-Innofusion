"""Server-side deterministic graph layout for React Flow."""

ZONE_X = {
 "dmz": 100,
 "internal": 350,
 "crown_jewel": 600,
 "cloud": 850,
}

def layout_nodes(assets: list, zones: list) -> dict[str, dict]:
 """Return {asset_id: {x, y}} deterministic positions."""
 zone_map = {z.id: z.kind for z in zones}
 by_zone: dict[str, list] = {}
 for a in assets:
 kind = zone_map.get(a.zone_id or "", "internal")
 by_zone.setdefault(kind, []).append(a)

 positions = {}
 for kind, group in by_zone.items():
 x = ZONE_X.get(kind, 300)
 for i, asset in enumerate(sorted(group, key=lambda a: a.ip)):
 positions[asset.id] = {"x": float(x), "y": float(80 + i * 120)}
 return positions
