import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
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
  Radio,
  FileCode,
} from "lucide-react";
import { useAuth } from "../../auth";
import "./landing.css";
import "./landing-cinema.css";
import heroBg from "../../assets/hero-bg.jpg";

export default function Landing() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="hml">
      {/* 1. SCROLL PROGRESS — Fixed at top with spring smoothing */}
      <motion.div className="hml-scroll-progress-bar" style={{ scaleX }} />

      <TopStatusStrip />
      <Navbar />
      <main>
        <HeroSection scrollYProgress={scrollYProgress} />
        <InteractivePathSection />
        {/* 2, 3, 4, 5. TRUE SCROLL-DRIVEN HORIZONTAL SCROLL & PIN ANIMATION */}
        <ScrollDrivenHorizontalPipeline />
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
        <span style={{ opacity: 0.3 }}>|</span>
        <span>ENGINE: NETWORKX 3.3 (BOUNDED YEN'S K-SHORTEST)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>STATUS: <span style={{ color: "var(--color-status-success)", fontWeight: 700 }}>OPERATIONAL</span></span>
        <span>UTC: {time}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Navigation Bar */
function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hml-nav hml-wrap"
    >
      <div className="hml-nav-inner">
        <Link to="/" className="hml-brand">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.35)",
            }}
          >
            <Shield size={16} color="#ffffff" />
          </motion.div>
          <span>DR<em>I</em>SHTI</span>
        </Link>

        <ul className="hml-nav-links">
          <li><a href="#topology" className="hml-nav-link">Attack Topology</a></li>
          <li><a href="#pipeline" className="hml-nav-link">Pipeline</a></li>
          <li><a href="#pillars" className="hml-nav-link">Architecture</a></li>
          <li><a href="#comparison" className="hml-nav-link">Comparison</a></li>
          <li><a href="#playbooks" className="hml-nav-link">Playbooks</a></li>
          <li><a href="#faq" className="hml-nav-link">FAQ</a></li>
        </ul>

        <div className="hml-nav-actions">
          <Link to="/login" className="hml-btn-ghost">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/signup" className="hml-btn-primary">
              Launch Console <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------- 6. PARALLAX Hero Section */
function HeroSection({ scrollYProgress }: { scrollYProgress: any }) {
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  return (
    <section className="hml-hero hml-wrap">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hml-pill-tag"
      >
        <span className="hml-pill-dot"></span>
        <span>Graph-Theoretic Defensive Security</span>
        <span style={{ color: "var(--color-text-muted)" }}>•</span>
        <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>Zero-Hallucination Impact</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hml-hero-title"
      >
        Autonomous Attack Surface Defense & Dollar Exposure Modeling
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="hml-hero-desc"
      >
        Drishti models entire enterprise networks as directed graphs, enumerates multi-hop attack vectors using Yen's algorithm, and deterministically calculates financial exposure before adversaries can exploit it.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="hml-hero-cta"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/signup" className="hml-btn-accent">
            Launch Interactive Console <ArrowRight size={16} />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <a href="#topology" className="hml-btn-outline">
            Explore Attack Surface Map
          </a>
        </motion.div>
      </motion.div>

      {/* Hero Showcase with Parallax Image Blend */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="hml-hero-stage"
      >
        <div className="hml-hero-img-wrap">
          <motion.img
            src={heroBg}
            alt="Drishti Threat Intelligence HUD"
            className="hml-hero-img"
            style={{ y: heroImageY, scale: heroScale }}
          />

          <div className="hml-hero-hud">
            <div className="hml-hud-header">
              <div className="hml-hud-title">
                <Activity size={18} color="var(--color-accent)" />
                <span style={{ fontWeight: 700 }}>LIVE TOPOLOGY AUDIT</span>
                <span style={{ color: "#8b8f87" }}>/ ACME_CORP_SAMPLE</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="hml-hud-badge hml-hud-badge-danger">5 CHAINED ATTACK PATHS</span>
                <span className="hml-hud-badge" style={{ background: "rgba(234, 88, 12, 0.2)", color: "#fb923c", border: "1px solid rgba(234, 88, 12, 0.4)" }}>
                  POSTGRESQL ADVISORY LOCK
                </span>
              </div>
            </div>

            <div className="hml-hud-stats">
              <motion.div whileHover={{ y: -3 }} className="hml-stat-card">
                <div className="hml-stat-label">Total Financial Exposure</div>
                <div className="hml-stat-val hml-stat-val-danger">$902,900</div>
                <div className="hml-stat-sub">Deterministic calculation ($ USD)</div>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} className="hml-stat-card">
                <div className="hml-stat-label">Critical Crown Jewel</div>
                <div className="hml-stat-val">Main DB</div>
                <div className="hml-stat-sub">10.0.0.5 · Criticality 1.0</div>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} className="hml-stat-card">
                <div className="hml-stat-label">Post-Remediation Impact</div>
                <div className="hml-stat-val hml-stat-val-accent">$702,900</div>
                <div className="hml-stat-sub">-$200,000 net risk reduction</div>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} className="hml-stat-card">
                <div className="hml-stat-label">Defense Guardrail</div>
                <div className="hml-stat-val" style={{ color: "#4ade80" }}>PASS (100%)</div>
                <div className="hml-stat-sub">Output-side offensive scanner active</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
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
      name: "Path #1",
      subtitle: "Foothold to Main DB",
      target: "PostgreSQL Database (10.0.0.5)",
      hops: [
        { label: "Entry Point", name: "INTERNET", ip: "0.0.0.0", type: "entry" },
        { label: "Hop 01", name: "Edge Firewall", ip: "192.168.1.1", type: "fw" },
        { label: "Hop 02", name: "Web Server", ip: "192.168.1.10", type: "srv" },
        { label: "Crown Jewel", name: "PostgreSQL DB", ip: "10.0.0.5", type: "target" },
      ],
      vuln: "CVE-2024-4321 (PostgreSQL Privilege Escalation)",
      likelihood: remediated ? 0.05 : 0.88,
      exposure: remediated ? 250000 : 902900,
      riskScore: remediated ? 24.5 : 94.2,
    },
    {
      id: 2,
      name: "Path #2",
      subtitle: "Customer Vault Compromise",
      target: "Customer Data Vault (10.0.0.8)",
      hops: [
        { label: "Entry Point", name: "INTERNET", ip: "0.0.0.0", type: "entry" },
        { label: "Hop 01", name: "Edge Firewall", ip: "192.168.1.1", type: "fw" },
        { label: "Hop 02", name: "API Gateway", ip: "192.168.1.50", type: "srv" },
        { label: "Crown Jewel", name: "Data Vault", ip: "10.0.0.8", type: "target" },
      ],
      vuln: "CVE-2024-2141 (Apache Log4j RCE)",
      likelihood: 0.72,
      exposure: 750000,
      riskScore: 86.5,
    },
    {
      id: 3,
      name: "Path #3",
      subtitle: "Keycloak Auth Bypass",
      target: "Auth Keycloak (192.168.1.15)",
      hops: [
        { label: "Entry Point", name: "INTERNET", ip: "0.0.0.0", type: "entry" },
        { label: "Hop 01", name: "Edge Firewall", ip: "192.168.1.1", type: "fw" },
        { label: "Crown Jewel", name: "Auth Keycloak", ip: "192.168.1.15", type: "target" },
      ],
      vuln: "CVE-2024-1188 (OpenSSH Auth Bypass)",
      likelihood: 0.54,
      exposure: 350000,
      riskScore: 69.4,
    },
  ];

  const current = paths.find((p) => p.id === selectedPath) || paths[0];

  return (
    <section id="topology" className="hml-section hml-wrap">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-section-header"
      >
        <span className="hml-section-tag">Graph Engine Demonstration</span>
        <h2 className="hml-section-title">Bounded Yen's Shortest Path Simulator</h2>
        <p className="hml-section-desc">
          See how resolving a single upstream vulnerability breaks the lateral movement chain and mathematically slashes financial exposure.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="hml-card"
        style={{ background: "var(--color-surface-raised)", padding: "clamp(1.5rem, 3vw, 2.5rem)", boxShadow: "var(--shadow-lift)" }}
      >
        {/* Top Controls Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {paths.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setSelectedPath(p.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-pill)",
                  background: selectedPath === p.id ? "#171916" : "#ffffff",
                  border: `1px solid ${selectedPath === p.id ? "#171916" : "rgba(23, 25, 22, 0.15)"}`,
                  color: selectedPath === p.id ? "#ffffff" : "#171916",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: selectedPath === p.id ? "0 4px 12px rgba(23, 25, 22, 0.2)" : "0 1px 3px rgba(23, 25, 22, 0.05)",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {selectedPath === p.id && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent)" }} />
                )}
                <span>{p.name}</span>
                <span style={{ fontSize: "0.75rem", opacity: selectedPath === p.id ? 0.7 : 0.5, fontWeight: 500 }}>({p.subtitle})</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRemediated(!remediated)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.4rem",
              borderRadius: "var(--radius-pill)",
              background: remediated ? "rgba(21, 128, 61, 0.1)" : "rgba(234, 88, 12, 0.1)",
              border: `1px solid ${remediated ? "#15803d" : "#ea580c"}`,
              color: remediated ? "#15803d" : "#ea580c",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {remediated ? (
              <>
                <CheckCircle2 size={16} />
                <span>CVE Remediated (Risk Dropped)</span>
              </>
            ) : (
              <span>Simulate Finding Resolution</span>
            )}
          </motion.button>
        </div>

        {/* Nodes Diagram */}
        <div className="hml-path-nodes" style={{ background: "var(--color-surface-base)", padding: "1.5rem", borderRadius: "var(--radius-card)", border: "1px solid rgba(23, 25, 22, 0.08)" }}>
          {current.hops.map((hop, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "1rem 1.25rem",
                  background: hop.type === "entry" ? "#fff5f5" : hop.type === "target" ? "#fff8f5" : "#ffffff",
                  border: `1px solid ${hop.type === "entry" ? "rgba(225, 29, 72, 0.3)" : hop.type === "target" ? "rgba(234, 88, 12, 0.4)" : "rgba(23, 25, 22, 0.1)"}`,
                  borderRadius: "10px",
                  minWidth: "155px",
                  boxShadow: "0 2px 8px rgba(23, 25, 22, 0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-family-mono)", fontWeight: 700, textTransform: "uppercase", color: hop.type === "entry" ? "#e11d48" : hop.type === "target" ? "#ea580c" : "#555951" }}>
                    {hop.label}
                  </span>
                  <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-family-mono)", color: "#8b8f87" }}>
                    {hop.ip}
                  </span>
                </div>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#171916" }}>
                  {hop.name}
                </span>
              </motion.div>
              {index < current.hops.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingInline: "0.25rem" }}>
                  <ArrowRight size={18} color="var(--color-accent)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border-subtle)" }}>
          <div style={{ padding: "1rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.06)" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", color: "#555951", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
              Exploited Vulnerability
            </div>
            <div style={{ color: "#171916", fontWeight: 800, fontSize: "0.95rem" }}>{current.vuln}</div>
          </div>
          <div style={{ padding: "1rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.06)" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", color: "#555951", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
              Traversal Likelihood
            </div>
            <div style={{ color: remediated ? "#15803d" : "#ea580c", fontWeight: 800, fontSize: "1.35rem" }}>
              {(current.likelihood * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{ padding: "1rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.06)" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", color: "#555951", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
              Total Financial Impact
            </div>
            <div style={{ color: remediated ? "#15803d" : "#e11d48", fontWeight: 800, fontSize: "1.35rem" }}>
              ${current.exposure.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.06)" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", color: "#555951", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
              Composite Path Risk
            </div>
            <div style={{ color: remediated ? "#15803d" : "#e11d48", fontWeight: 800, fontSize: "1.35rem" }}>
              {current.riskScore.toFixed(1)} / 100
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------- 2, 3, 4, 5. SCROLL-DRIVEN HORIZONTAL SCROLL & PIN */
function ScrollDrivenHorizontalPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Vertical scroll scrubs horizontal movement from 0% to -62%
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);
  const progressPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const stages = [
    {
      num: "01",
      title: "LAN & Perimeter Ingestion",
      tag: "INGESTION TIER",
      icon: <Radio size={20} color="var(--color-accent)" />,
      desc: "Edge agent collects stdlib ARP discovery, DNS configurations, and open port bindings under strict RFC1918 scope gates.",
      cmd: "arp_scan",
      arg: "'192.168.1.0/24'",
      result: "14 hosts discovered",
    },
    {
      num: "02",
      title: "Directed Graph Topology",
      tag: "NETWORKX DiGraph",
      icon: <Network size={20} color="var(--color-accent)" />,
      desc: "NetworkX models edge traversal difficulties, betweenness centralities, and reachable subnet distance from INTERNET roots.",
      cmd: "DiGraph",
      arg: "nodes=14, edges=32",
      result: "density=0.175",
    },
    {
      num: "03",
      title: "Bounded Yen's Path Solver",
      tag: "GRAPH ALGORITHMS",
      icon: <Layers size={20} color="var(--color-accent)" />,
      desc: "Computes top 5 shortest attack paths per crown jewel (max 6 hops, top 25 globally) avoiding combinatorial cycle traps.",
      cmd: "yen_k_shortest",
      arg: "source='INTERNET', k=5",
      result: "optimal routes ranked",
    },
    {
      num: "04",
      title: "Deterministic $ Valuation",
      tag: "FINANCIAL ENGINE",
      icon: <DollarSign size={20} color="var(--color-accent)" />,
      desc: "Mathematical risk pricing: Likelihood × Asset Value × Multiplier + Breach Base ($500K). Zero LLM pricing hallucinations.",
      cmd: "calc_exposure",
      arg: "likelihood=0.88, base=$500k",
      result: "$902,900 USD",
    },
    {
      num: "05",
      title: "Defensive Playbook Synthesis",
      tag: "AI GUARDRAILS",
      icon: <FileCode size={20} color="var(--color-accent)" />,
      desc: "NVIDIA NIM (Llama 3.3 70B) synthesizes Ansible, Shell, and AWS CLI scripts with strict output-side offensive marker blocks.",
      cmd: "ansible_gen",
      arg: "cve='CVE-2024-4321'",
      result: "verified patch ready",
    },
  ];

  return (
    <div id="pipeline" ref={containerRef} className="hml-horizontal-scroll-section">
      {/* Pinned Sticky Window for Full Viewport */}
      <div className="hml-horizontal-sticky">
        <div className="hml-wrap" style={{ marginBottom: "2.5rem", paddingTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div className="hml-section-tag" style={{ marginBottom: "0.5rem" }}>
                Continuous Defensive Pipeline
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", fontWeight: 800, color: "#171916", margin: 0, letterSpacing: "-0.03em" }}>
                End-to-End Threat Pipeline
              </h2>
            </div>
            {/* Scroll-Linked Progress Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", background: "#ffffff", padding: "0.6rem 1.35rem", borderRadius: "var(--radius-pill)", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-primary)", color: "#555951", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Scroll Progress
              </span>
              <div style={{ width: "90px", height: "6px", background: "#eae5dc", borderRadius: "999px", overflow: "hidden" }}>
                <motion.div style={{ width: progressPercent, height: "100%", background: "var(--color-accent)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontally Scrubbed Track */}
        <motion.div style={{ x }} className="hml-horizontal-track">
          {stages.map((stage, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="hml-horizontal-card"
              style={{
                borderRadius: "16px",
                padding: "2rem",
                background: "#ffffff",
                border: "1px solid rgba(23, 25, 22, 0.1)",
                boxShadow: "0 10px 30px rgba(23, 25, 22, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "340px",
              }}
            >
              <div>
                {/* Header with Number and Category */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.35rem", fontFamily: "var(--font-family-primary)", fontWeight: 800, color: "var(--color-accent)", letterSpacing: "-0.02em" }}>
                      {stage.num}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#8b8f87", fontWeight: 600 }}>/ 05</span>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-family-primary)", fontWeight: 700, letterSpacing: "0.04em", padding: "0.25rem 0.65rem", borderRadius: "var(--radius-pill)", background: "#f4f1ea", color: "#555951", border: "1px solid rgba(23, 25, 22, 0.06)" }}>
                    {stage.tag}
                  </span>
                </div>

                {/* Title & Icon */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(234, 88, 12, 0.08)", border: "1px solid rgba(234, 88, 12, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {stage.icon}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#171916", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                    {stage.title}
                  </h3>
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.92rem", color: "#555951", lineHeight: 1.6, margin: 0 }}>
                  {stage.desc}
                </p>
              </div>

              {/* Polished Mini-Terminal Telemetry */}
              <div style={{ background: "#0f110e", borderRadius: "10px", padding: "0.9rem 1.1rem", fontFamily: "var(--font-family-mono)", fontSize: "0.75rem", color: "#f2efe7", border: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "1.5rem", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ea580c" }} />
                  <span style={{ color: "#a1a59c", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>TELEMETRY EXEC</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", overflow: "hidden", whiteSpace: "nowrap" }}>
                  <span style={{ color: "#fb923c", fontWeight: 700 }}>&gt;</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{stage.cmd}</span>
                  <span style={{ color: "#a1a59c" }}>({stage.arg})</span>
                  <span style={{ color: "#4ade80", marginLeft: "auto", fontSize: "0.7rem", fontWeight: 600 }}>→ {stage.result}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-section-header"
      >
        <span className="hml-section-tag">System Architecture</span>
        <h2 className="hml-section-title">Six Pillars of Defensive Intelligence</h2>
        <p className="hml-section-desc">
          Built on mathematical rigor, graph theory, and cryptographically verified data boundaries.
        </p>
      </motion.div>

      <div className="hml-grid-3">
        {pillars.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="hml-card"
          >
            <div className="hml-card-icon">{p.icon}</div>
            <h3 className="hml-card-title">{p.title}</h3>
            <p className="hml-card-body">{p.body}</p>
          </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-section-header"
      >
        <span className="hml-section-tag">Competitive Benchmark</span>
        <h2 className="hml-section-title">Legacy Scanners vs. Drishti Graph Defense</h2>
        <p className="hml-section-desc">
          Why traditional vulnerability assessment fails in modern enterprise topologies.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-table-wrap"
      >
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
                <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{c.dimension}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{c.legacy}</td>
                <td className="hml-table-winner">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={16} color="var(--color-accent)" />
                    <span>{c.drishti}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
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
echo "[+] Ingress rules applied. Direct internet access blocked."`,
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-section-header"
      >
        <span className="hml-section-tag">Automated Remediation</span>
        <h2 className="hml-section-title">Context-Aware Defensive Playbooks</h2>
        <p className="hml-section-desc">
          AI generates production-ready Ansible, Shell, or Cloud CLI fixes tailored to your actual hostnames and CVEs.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-terminal"
      >
        <div className="hml-terminal-bar">
          <div className="hml-terminal-dots">
            <div className="hml-terminal-dot"></div>
            <div className="hml-terminal-dot"></div>
            <div className="hml-terminal-dot"></div>
          </div>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <button
              onClick={() => setActiveTab("ansible")}
              style={{ background: "none", border: "none", color: activeTab === "ansible" ? "var(--color-accent)" : "#8b8f87", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
            >
              Ansible Playbook
            </button>
            <button
              onClick={() => setActiveTab("shell")}
              style={{ background: "none", border: "none", color: activeTab === "shell" ? "var(--color-accent)" : "#8b8f87", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
            >
              Shell Script
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              style={{ background: "none", border: "none", color: activeTab === "aws" ? "var(--color-accent)" : "#8b8f87", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
            >
              AWS CLI
            </button>
          </div>
          <span style={{ opacity: 0.6 }}>DEFENSIVE_ONLY_VERIFIED</span>
        </div>
        <div className="hml-terminal-body">
          <pre>{playbooks[activeTab]}</pre>
        </div>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-section-header"
      >
        <span className="hml-section-tag">Frequently Asked Questions</span>
        <h2 className="hml-section-title">Everything You Need to Know</h2>
        <p className="hml-section-desc">
          Technical specifications, compliance boundaries, and mathematical modeling details.
        </p>
      </motion.div>

      <div className="hml-faq-list">
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="hml-faq-item"
          >
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
                  color: "var(--color-accent)",
                }}
              />
            </button>
            {openIdx === i && <div className="hml-faq-content">{f.a}</div>}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- CTA Band */
function CtaBandSection() {
  return (
    <section className="hml-wrap" style={{ paddingBottom: "4rem" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="hml-cta-band"
      >
        <div style={{ maxWidth: "42rem", marginInline: "auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 800, marginBottom: "1rem", color: "var(--color-text-primary)" }}>
            Ready to Defend Your Attack Surface?
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Launch the interactive security console to explore the Acme Corporation sample network or deploy the edge agent on your private LAN.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/signup" className="hml-btn-accent">
                Get Started Free <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/login" className="hml-btn-outline">
                Sign In to Existing Tenant
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------- Footer */
function FooterSection() {
  return (
    <footer className="hml-footer hml-wrap">
      <div className="hml-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={12} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>DRISHTI PLATFORM</span>
          <span style={{ color: "var(--color-border-hover)" }}>•</span>
          <span style={{ color: "var(--color-text-muted)" }}>Defensive Cybersecurity Engineering</span>
        </div>

        <div className="hml-footer-links">
          <a href="#topology">Topology</a>
          <a href="#pipeline">Pipeline</a>
          <a href="#pillars">Architecture</a>
          <a href="#comparison">Comparison</a>
          <a href="#playbooks">Playbooks</a>
          <a href="#faq">FAQ</a>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
      <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        © 2026 Drishti Cyber Defense Systems. Bounded Yen's Shortest Path & Dollar Financial Exposure Architecture.
      </div>
    </footer>
  );
}
