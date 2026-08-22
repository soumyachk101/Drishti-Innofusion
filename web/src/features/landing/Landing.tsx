import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Shield,
  Activity,
  ArrowRight,
  ChevronDown,
  Lock,
  Layers,
  CheckCircle2,
  DollarSign,
  Network,
  Eye,
} from "lucide-react";
import { useAuth } from "../../auth";
import "./landing.css";
import "./landing-cinema.css";
import heroBg from "../../assets/hero-bg.jpg";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="hml">
      <TopStatusStrip />
      <Navbar />
      <main>
        <HeroSection />
        <InteractivePathSection />
        <PillarsSection />
        <ComparisonSection />
        <PlaybookTerminalSection />
        <FaqSection />
        <CtaBandSection />
      </main>
      <FooterSection />
    </div>
  );
}

/* ------------------------------------------------------------- Top Status Strip */
function TopStatusStrip() {
  const [time, setTime] = useState(() => new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hml-strip">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>DRISHTI <em>//</em> DEFENSIVE GRAPH INTELLIGENCE</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>ENGINE: NETWORKX 3.3 (BOUNDED YEN'S K-SHORTEST)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>STATUS: <span style={{ color: "var(--color-emerald)" }}>OPERATIONAL</span></span>
        <span>UTC: {time}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Navigation Bar */
function Navbar() {
  return (
    <nav className="hml-nav hml-wrap">
      <div className="hml-nav-inner">
        <Link to="/" className="hml-brand">
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.35)" }}>
            <Shield size={16} color="#ffffff" />
          </div>
          <span>DR<em>I</em>SHTI</span>
        </Link>

        <ul className="hml-nav-links">
          <li><a href="#topology" className="hml-nav-link">Attack Topology</a></li>
          <li><a href="#pillars" className="hml-nav-link">Architecture</a></li>
          <li><a href="#comparison" className="hml-nav-link">Comparison</a></li>
          <li><a href="#playbooks" className="hml-nav-link">Playbooks</a></li>
          <li><a href="#faq" className="hml-nav-link">FAQ</a></li>
        </ul>

        <div className="hml-nav-actions">
          <Link to="/login" className="hml-btn-ghost">
            Sign In
          </Link>
          <Link to="/signup" className="hml-btn-primary">
            Launch Console <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------- Hero Section */
function HeroSection() {
  return (
    <section className="hml-hero hml-wrap">
      <div className="hml-pill-tag">
        <span className="hml-pill-dot"></span>
        <span>Graph-Theoretic Defensive Security</span>
        <span style={{ color: "var(--color-dim)" }}>•</span>
        <span style={{ color: "var(--color-accent)" }}>Zero-Hallucination Impact</span>
      </div>

      <h1 className="hml-hero-title">
        Autonomous Attack Surface Defense & Dollar Exposure Modeling
      </h1>

      <p className="hml-hero-desc">
        Drishti models entire enterprise networks as directed graphs, enumerates multi-hop attack vectors using Yen's algorithm, and deterministically calculates financial exposure before adversaries can exploit it.
      </p>

      <div className="hml-hero-cta">
        <Link to="/signup" className="hml-btn-accent">
          Launch Interactive Console <ArrowRight size={16} />
        </Link>
        <a href="#topology" className="hml-btn-outline">
          Explore Attack Surface Map
        </a>
      </div>

      {/* Hero Showcase with Hero Image Blend */}
      <div className="hml-hero-stage">
        <div className="hml-hero-img-wrap">
          <img src={heroBg} alt="Drishti Threat Intelligence HUD" className="hml-hero-img" />
          <div className="hml-hero-overlay-grid"></div>

          <div className="hml-hero-hud">
            <div className="hml-hud-header">
              <div className="hml-hud-title">
                <Activity size={18} color="var(--color-accent)" />
                <span style={{ fontWeight: 600 }}>LIVE TOPOLOGY AUDIT</span>
                <span style={{ color: "var(--color-dim)" }}>/ ACME_CORP_SAMPLE</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="hml-hud-badge hml-hud-badge-danger">5 CHAINED ATTACK PATHS</span>
                <span className="hml-hud-badge" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
                  POSTGRESQL ADVISORY LOCK
                </span>
              </div>
            </div>

            <div className="hml-hud-stats">
              <div className="hml-stat-card">
                <div className="hml-stat-label">Total Financial Exposure</div>
                <div className="hml-stat-val hml-stat-val-danger">$902,900</div>
                <div className="hml-stat-sub">Deterministic calculation ($ USD)</div>
              </div>

              <div className="hml-stat-card">
                <div className="hml-stat-label">Critical Crown Jewel</div>
                <div className="hml-stat-val">Main DB</div>
                <div className="hml-stat-sub">10.0.0.5 · Criticality 1.0</div>
              </div>

              <div className="hml-stat-card">
                <div className="hml-stat-label">Post-Remediation Impact</div>
                <div className="hml-stat-val hml-stat-val-accent">$702,900</div>
                <div className="hml-stat-sub">-$200,000 net risk reduction</div>
              </div>

              <div className="hml-stat-card">
                <div className="hml-stat-label">Defense Guardrail</div>
                <div className="hml-stat-val" style={{ color: "var(--color-emerald)" }}>PASS (100%)</div>
                <div className="hml-stat-sub">Output-side offensive scanner active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Interactive Path Simulator */
function InteractivePathSection() {
  const [selectedPath, setSelectedPath] = useState(1);
  const [remediated, setRemediated] = useState(false);

  const paths = [
    {
      id: 1,
      name: "Path #1: External Foothold to Crown Jewel",
      target: "PostgreSQL Database (10.0.0.5)",
      hops: ["INTERNET (0.0.0.0)", "Edge Firewall (192.168.1.1)", "Web Server (192.168.1.10)", "PostgreSQL Main DB (10.0.0.5)"],
      vuln: "CVE-2024-4321 (PostgreSQL Privilege Escalation)",
      likelihood: remediated ? 0.05 : 0.88,
      exposure: remediated ? 250000 : 902900,
      riskScore: remediated ? 24.5 : 94.2,
    },
    {
      id: 2,
      name: "Path #2: Customer Vault Compromise",
      target: "Customer Data Vault (10.0.0.8)",
      hops: ["INTERNET (0.0.0.0)", "Edge Firewall (192.168.1.1)", "API Gateway (192.168.1.50)", "Data Vault (10.0.0.8)"],
      vuln: "CVE-2024-2141 (Apache Log4j RCE)",
      likelihood: 0.72,
      exposure: 750000,
      riskScore: 86.5,
    },
    {
      id: 3,
      name: "Path #3: Internal Keycloak Auth Bypass",
      target: "Auth Keycloak (192.168.1.15)",
      hops: ["INTERNET (0.0.0.0)", "Edge Firewall (192.168.1.1)", "Auth Keycloak (192.168.1.15)"],
      vuln: "CVE-2024-1188 (OpenSSH Auth Bypass)",
      likelihood: 0.54,
      exposure: 350000,
      riskScore: 69.4,
    },
  ];

  const current = paths.find((p) => p.id === selectedPath) || paths[0];

  return (
    <section id="topology" className="hml-section hml-wrap">
      <div className="hml-section-header">
        <span className="hml-section-tag">Graph Engine Demonstration</span>
        <h2 className="hml-section-title">Bounded Yen's Shortest Path Simulator</h2>
        <p className="hml-section-desc">
          See how resolving a single upstream vulnerability breaks the lateral movement chain and mathematically slashes financial exposure.
        </p>
      </div>

      <div className="hml-card" style={{ background: "var(--color-map-well)", padding: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {paths.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPath(p.id)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-pill)",
                  background: selectedPath === p.id ? "var(--color-paper-elevated)" : "transparent",
                  border: `1px solid ${selectedPath === p.id ? "var(--color-accent)" : "var(--color-rule)"}`,
                  color: selectedPath === p.id ? "#fff" : "var(--color-muted)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p.name.split(":")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setRemediated(!remediated)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-pill)",
              background: remediated ? "rgba(16,185,129,0.15)" : "rgba(225,29,72,0.15)",
              border: `1px solid ${remediated ? "var(--color-emerald)" : "var(--color-crimson)"}`,
              color: remediated ? "#34d399" : "#fb7185",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {remediated ? "✓ CVE Remediated (Risk Dropped)" : "⚡ Simulate Finding Resolution"}
          </button>
        </div>

        <div className="hml-path-nodes">
          {current.hops.map((hop, index) => (
            <React.Fragment key={index}>
              <div className={`hml-path-node ${index === 0 ? "is-entry" : index === current.hops.length - 1 ? "is-target" : ""}`}>
                <span className="hml-node-kind">{index === 0 ? "Entry Point" : index === current.hops.length - 1 ? "Crown Jewel" : `Hop 0${index}`}</span>
                <span className="hml-node-name">{hop}</span>
              </div>
              {index < current.hops.length - 1 && <span className="hml-path-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-rule)" }}>
          <div>
            <div className="hml-stat-label">Exploited Vulnerability</div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{current.vuln}</div>
          </div>
          <div>
            <div className="hml-stat-label">Path Traversal Likelihood</div>
            <div style={{ color: remediated ? "var(--color-emerald)" : "#ffd54f", fontWeight: 700, fontSize: "1.25rem" }}>
              {(current.likelihood * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="hml-stat-label">Total Financial Impact</div>
            <div style={{ color: remediated ? "var(--color-emerald)" : "#fb7185", fontWeight: 700, fontSize: "1.25rem" }}>
              ${current.exposure.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="hml-stat-label">Composite Path Risk</div>
            <div style={{ color: remediated ? "var(--color-emerald)" : "#fb7185", fontWeight: 700, fontSize: "1.25rem" }}>
              {current.riskScore.toFixed(1)} / 100
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Engineering Pillars */
function PillarsSection() {
  const pillars = [
    {
      icon: <Network size={20} />,
      title: "Directed Graph Topology",
      body: "Constructs an in-memory NetworkX DiGraph capturing entry points, DMZs, firewalls, and internal trust relationships with weighted edge traversal models.",
    },
    {
      icon: <Layers size={20} />,
      title: "Bounded Yen's Path Enumeration",
      body: "Enumerates up to 5 shortest paths per crown jewel (bounded at max 6 hops, top 25 globally), eliminating the computational explosion of simple paths.",
    },
    {
      icon: <DollarSign size={20} />,
      title: "Deterministic Impact ($ USD)",
      body: "Calculates real dollar risk using mathematical formulas based on asset value and breach base costs. AI never alters financial numbers.",
    },
    {
      icon: <Shield size={20} />,
      title: "Defensive-Only AI Guardrails",
      body: "Integrated with NVIDIA NIM (Llama 3.3 70B). Employs strict output-side marker scanning to guarantee zero offensive exploit generation.",
    },
    {
      icon: <Eye size={20} />,
      title: "Real-Time Telemetry Watch",
      body: "Edge agent detects LAN devices via ARP and flags MITRE ATT&CK threats (ARP spoofing T1557, rogue hardware T1200, risky ports T1210).",
    },
    {
      icon: <Lock size={20} />,
      title: "Zero-Latency Web Guard",
      body: "Manifest V3 Chrome extension enforces in-browser domain trust verdicts using a transparent two-part scoring algorithm with hard risk caps.",
    },
  ];

  return (
    <section id="pillars" className="hml-section hml-wrap">
      <div className="hml-section-header">
        <span className="hml-section-tag">System Architecture</span>
        <h2 className="hml-section-title">Six Pillars of Defensive Intelligence</h2>
        <p className="hml-section-desc">
          Built on mathematical rigor, graph theory, and cryptographically verified data boundaries.
        </p>
      </div>

      <div className="hml-grid-3">
        {pillars.map((p, idx) => (
          <div key={idx} className="hml-card">
            <div className="hml-card-icon">{p.icon}</div>
            <h3 className="hml-card-title">{p.title}</h3>
            <p className="hml-card-body">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Comparison Matrix */
function ComparisonSection() {
  const comparisons = [
    {
      dimension: "Attack Surface Representation",
      legacy: "Flat, disconnected list of CVEs without context",
      drishti: "Directed topological graph with multi-hop lateral movement chains",
    },
    {
      dimension: "Prioritization Logic",
      legacy: "Raw CVSS score (treats isolated internal hosts same as gateways)",
      drishti: "Graph centrality + reachable distance from INTERNET + crown jewel value",
    },
    {
      dimension: "Risk Quantification",
      legacy: "Abstract high/medium/low ratings without financial meaning",
      drishti: "Deterministic dollar exposure ($ USD) CISO board-ready metric",
    },
    {
      dimension: "AI Integration Safety",
      legacy: "Unconstrained prompts prone to hallucinations and exploit generation",
      drishti: "Output-side offensive marker scanning with defensive-only verification",
    },
    {
      dimension: "Scan Scope & Compliance",
      legacy: "Blind automated port probing across arbitrary subnets",
      drishti: "Strict RFC1918 private scope gate with explicit consent validation",
    },
  ];

  return (
    <section id="comparison" className="hml-section hml-wrap">
      <div className="hml-section-header">
        <span className="hml-section-tag">Competitive Benchmark</span>
        <h2 className="hml-section-title">Legacy Scanners vs. Drishti Graph Defense</h2>
        <p className="hml-section-desc">
          Why traditional vulnerability assessment fails in modern enterprise topologies.
        </p>
      </div>

      <div className="hml-table-wrap">
        <table className="hml-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Dimension</th>
              <th style={{ width: "35%" }}>Traditional Scanners</th>
              <th style={{ width: "40%" }}>Drishti Defensive Platform</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: "#fff" }}>{c.dimension}</td>
                <td style={{ color: "var(--color-dim)" }}>{c.legacy}</td>
                <td className="hml-table-winner">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={16} color="#60a5fa" />
                    <span>{c.drishti}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Terminal Playbook Preview */
function PlaybookTerminalSection() {
  const [activeTab, setActiveTab] = useState<"ansible" | "shell" | "aws">("ansible");

  const playbooks = {
    ansible: `- name: Remediate PostgreSQL Privilege Escalation (CVE-2024-4321)
  hosts: databases
  become: yes
  tasks:
    - name: Patch postgresql-16 package to latest stable
      apt:
        name: postgresql-16
        state: latest
        update_cache: yes
    - name: Enforce strict scram-sha-256 in pg_hba.conf
      lineinfile:
        path: /etc/postgresql/16/main/pg_hba.conf
        regexp: '^host.*all.*all'
        line: 'host all all 10.0.0.0/24 scram-sha-256'
    - name: Restart PostgreSQL daemon
      service:
        name: postgresql
        state: restarted`,
    shell: `#!/usr/bin/env bash
# Drishti Automated Perimeter Hardening Script
set -euo pipefail

echo "[*] Applying ingress firewall rules to isolate database tier..."
iptables -A INPUT -p tcp --dport 5432 ! -s 10.0.0.0/24 -j DROP
iptables -A INPUT -p tcp --dport 22 ! -s 192.168.1.0/24 -j DROP

# Save iptables state
iptables-save > /etc/iptables/rules.v4
echo "[✓] Ingress rules applied. Direct internet access blocked."`,
    aws: `# AWS Security Group Remediation for Crown Jewel DB
aws ec2 revoke-security-group-ingress \\
    --group-id sg-0123456789abcdef0 \\
    --protocol tcp \\
    --port 5432 \\
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \\
    --group-id sg-0123456789abcdef0 \\
    --protocol tcp \\
    --port 5432 \\
    --source-security-group-id sg-0987654321fedcba0 \\
    --group-owner 123456789012`,
  };

  return (
    <section id="playbooks" className="hml-section hml-wrap">
      <div className="hml-section-header">
        <span className="hml-section-tag">Automated Remediation</span>
        <h2 className="hml-section-title">Context-Aware Defensive Playbooks</h2>
        <p className="hml-section-desc">
          AI generates production-ready Ansible, Shell, or Cloud CLI fixes tailored to your actual hostnames and CVEs.
        </p>
      </div>

      <div className="hml-terminal">
        <div className="hml-terminal-bar">
          <div className="hml-terminal-dots">
            <div className="hml-terminal-dot"></div>
            <div className="hml-terminal-dot"></div>
            <div className="hml-terminal-dot"></div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setActiveTab("ansible")}
              style={{ background: "none", border: "none", color: activeTab === "ansible" ? "#60a5fa" : "var(--color-dim)", cursor: "pointer", fontWeight: 600 }}
            >
              Ansible Playbook
            </button>
            <button
              onClick={() => setActiveTab("shell")}
              style={{ background: "none", border: "none", color: activeTab === "shell" ? "#60a5fa" : "var(--color-dim)", cursor: "pointer", fontWeight: 600 }}
            >
              Shell Script
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              style={{ background: "none", border: "none", color: activeTab === "aws" ? "#60a5fa" : "var(--color-dim)", cursor: "pointer", fontWeight: 600 }}
            >
              AWS CLI
            </button>
          </div>
          <span style={{ opacity: 0.6 }}>DEFENSIVE_ONLY_VERIFIED</span>
        </div>
        <div className="hml-terminal-body">
          <pre>{playbooks[activeTab]}</pre>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FAQ Section */
function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Drishti calculate financial dollar exposure?",
      a: "Drishti uses a deterministic mathematical formula: Path Impact = Likelihood × Target Asset Business Value × Asset Multiplier + Likelihood × Breach Base Cost. The total exposure sums the maximum impact per unique crown jewel across all bounded paths, ensuring no double-counting.",
    },
    {
      q: "How does Drishti ensure AI safety and prevent exploit generation?",
      a: "All LLM requests pass through a strict output-side scanner that checks for offensive markers ('reverse shell', 'weaponize', 'exfiltrate', 'ransomware'). If an offensive pattern is detected, the completion is refused immediately. The AI is restricted to defensive remediation and explanation.",
    },
    {
      q: "Can Drishti scan arbitrary public IP addresses?",
      a: "No. Drishti enforces strict RFC1918 private address verification and requires explicit 'consent: true' in request payloads. Scans targeting public IPs or AWS metadata endpoints are rejected with HTTP 422.",
    },
    {
      q: "What database backends are supported?",
      a: "Drishti supports PostgreSQL with transactional advisory locks for enterprise production, and local SQLite for development. All entity models use 36-character UUID strings for seamless portability across environments.",
    },
  ];

  return (
    <section id="faq" className="hml-section hml-wrap">
      <div className="hml-section-header">
        <span className="hml-section-tag">Frequently Asked Questions</span>
        <h2 className="hml-section-title">Everything You Need to Know</h2>
        <p className="hml-section-desc">
          Technical specifications, compliance boundaries, and mathematical modeling details.
        </p>
      </div>

      <div className="hml-faq-list">
        {faqs.map((f, i) => (
          <div key={i} className="hml-faq-item">
            <button
              className="hml-faq-trigger"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span>{f.q}</span>
              <ChevronDown
                size={18}
                style={{
                  transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
            {openIdx === i && <div className="hml-faq-content">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- CTA Band */
function CtaBandSection() {
  return (
    <section className="hml-wrap" style={{ paddingBottom: "4rem" }}>
      <div className="hml-cta-band">
        <div style={{ maxWidth: "38rem", marginInline: "auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 700, marginBottom: "1rem", color: "#fff" }}>
            Ready to Defend Your Attack Surface?
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Launch the interactive security console to explore the Acme Corporation sample network or deploy the edge agent on your private LAN.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/signup" className="hml-btn-accent">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="hml-btn-outline">
              Sign In to Existing Tenant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Footer */
function FooterSection() {
  return (
    <footer className="hml-footer hml-wrap">
      <div className="hml-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg, #3b82f6, #1e293b)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={12} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 700, color: "#fff" }}>DRISHTI PLATFORM</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>Defensive Cybersecurity Engineering</span>
        </div>

        <div className="hml-footer-links">
          <a href="#topology">Topology</a>
          <a href="#pillars">Architecture</a>
          <a href="#comparison">Comparison</a>
          <a href="#playbooks">Playbooks</a>
          <a href="#faq">FAQ</a>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
      <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "var(--color-dim)" }}>
        © 2026 Drishti Cyber Defense Systems. Bounded Yen's Shortest Path & Dollar Financial Exposure Architecture.
      </div>
    </footer>
  );
}
