"""Live threat detection — pure function over live inventory."""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class LiveThreat:
 kind: str
 severity: str
 title: str
 detail: str
 device: str | None
 evidence: str
 recommendation: str
 mitre: str | None = None


RISKY_PORTS = {21, 22, 23, 139, 445, 1900, 2323, 3389, 5900}


def detect_threats(
 devices: list,
 domains: list,
 deep_scan_cves: list | None = None,
 now: datetime | None = None,
) -> list[LiveThreat]:
 """Detect threats from live device/domain inventory."""
 if now is None:
 now = datetime.now(timezone.utc)
 threats: list[LiveThreat] = []

 # ARP-spoof: same IP claimed by >=2 different MACs
 ip_to_macs: dict[str, set[str]] = {}
 for d in devices:
 if d.ip:
 ip_to_macs.setdefault(d.ip, set()).add(d.mac or "unknown")
 for ip, macs in ip_to_macs.items():
 if len(macs) >= 2:
 threats.append(LiveThreat(
 kind="arp_spoof",
 severity="critical",
 title=f"ARP spoofing detected on {ip}",
 detail=f"IP {ip} claimed by {len(macs)} MACs: {', '.join(sorted(macs))}",
 device=ip,
 evidence="Multiple MACs for single IP in recent device batch",
 recommendation="Check ARP tables; set static ARP for gateway",
 mitre="T1557",
 ))

 # Rogue device: first_seen <= 10 min ago
 for d in devices:
 if d.is_self or d.is_gateway:
 continue
 if d.first_seen and (now - d.first_seen).total_seconds() <= 600:
 threats.append(LiveThreat(
 kind="rogue_device",
 severity="medium",
 title=f"Rogue device: {d.hostname or d.ip}",
 detail=f"Device {d.hostname or d.ip} (MAC: {d.mac}) appeared on network within 10 minutes",
 device=d.ip,
 evidence=f"First seen at {d.first_seen.isoformat()}",
 recommendation="Verify device ownership; block if unauthorized",
 mitre="T1200",
 ))

 # Malicious domain
 for dom in domains:
 if dom.band in ("Caution", "High Risk"):
 threats.append(LiveThreat(
 kind="malicious_domain",
 severity="high" if dom.band == "High Risk" else "medium",
 title=f"Suspicious domain: {dom.domain}",
 detail=f"Domain {dom.domain} rated {dom.band} (score: {dom.score})",
 device=dom.source_host or "",
 evidence=f"URL Trust score {dom.score}/100, band: {dom.band}",
 recommendation="Block domain at firewall/DNS; investigate source host",
 mitre="T1071",
 ))

 # Risky service (from deep scan)
 if deep_scan_cves:
 pass # handled by caller

 return threats


# Demo injector
_DEMO_LABEL = "DEMO-ATTACK"
_DEMO_MAC_PREFIX = "de:ad:be:ef:"


def inject_demo() -> list[dict]:
 """Return synthetic demo threats for injection."""
 return [
 {
 "mac": _DEMO_MAC_PREFIX + "01:01",
 "ip": "192.168.1.200",
 "hostname": "demo-intruder",
 "vendor": "Unknown",
 "is_gateway": False,
 "is_self": False,
 "online": True,
 "subnet": "192.168.1.0/24",
 "discovery": "arp",
 "label": _DEMO_LABEL,
 },
 {
 "kind": "arp_spoof",
 "severity": "critical",
 "title": f"Demo ARP spoof ({_DEMO_LABEL})",
 "detail": "Synthetic intruder claiming gateway MAC",
 "device": "192.168.1.200",
 "evidence": "Demo injection",
 "recommendation": "This is a demo threat — clear to remove",
 "mitre": "T1557",
 },
 ]


def clear_demo(devices: list) -> list:
 """Remove demo-labeled devices from list."""
 return [d for d in devices if getattr(d, "label", None) != _DEMO_LABEL]
