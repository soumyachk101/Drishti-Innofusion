import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
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
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
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
        <span>IST: {time} (KOLKATA)</span>
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

  return (
    <div id="pipeline" ref={containerRef} className="hml-horizontal-scroll-section">
      {/* Pinned Sticky Window for Full Viewport */}
      <div className="hml-horizontal-sticky">
        <div className="hml-wrap" style={{ marginBottom: "2rem", paddingTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div className="hml-section-tag" style={{ marginBottom: "0.4rem" }}>
                Continuous Defensive Engine
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", fontWeight: 800, color: "#171916", margin: 0, letterSpacing: "-0.03em" }}>
                End-to-End Threat Pipeline
              </h2>
            </div>
            {/* Scroll-Linked Progress Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", background: "#ffffff", padding: "0.6rem 1.35rem", borderRadius: "var(--radius-pill)", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-primary)", color: "#555951", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Scrub Engine
              </span>
              <div style={{ width: "90px", height: "6px", background: "#eae5dc", borderRadius: "999px", overflow: "hidden" }}>
                <motion.div style={{ width: progressPercent, height: "100%", background: "var(--color-accent)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontally Scrubbed Track with Custom Visual Cards */}
        <motion.div style={{ x }} className="hml-horizontal-track">
          {/* Card 01: Ingestion */}
          <motion.div whileHover={{ y: -6 }} className="hml-horizontal-card" style={{ width: "420px", flex: "0 0 420px", borderRadius: "18px", padding: "1.75rem", background: "#ffffff", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 800, color: "var(--color-accent)", background: "rgba(234, 88, 12, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "var(--radius-pill)" }}>
                  STAGE 01 // DISCOVERY
                </span>
                <span style={{ fontSize: "0.72rem", color: "#8b8f87", fontWeight: 600 }}>RFC1918 Private Gate</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#171916", margin: "0 0 0.5rem 0" }}>
                LAN & Perimeter Ingestion
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#555951", lineHeight: 1.55, margin: "0 0 1rem 0" }}>
                Edge agent performs ARP table polling, subnet broadcasts, and unauthenticated port discovery across internal assets.
              </p>
            </div>

            {/* Visual Subnet Telemetry Box */}
            <div style={{ background: "#0f110e", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#f2efe7", fontFamily: "var(--font-family-mono)", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.4rem" }}>
                <span style={{ color: "#fb923c", fontWeight: 700 }}>SUBNET 192.168.1.0/24</span>
                <span style={{ color: "#4ade80", fontSize: "0.7rem" }}>● 14 LIVE NODES</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>192.168.1.1 (Gateway)</span>
                  <span style={{ color: "#a1a59c" }}>PORT 22, 443</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>192.168.1.10 (Nginx DMZ)</span>
                  <span style={{ color: "#ff8598" }}>CVE-2024-4321</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 02: NetworkX Graph */}
          <motion.div whileHover={{ y: -6 }} className="hml-horizontal-card" style={{ width: "420px", flex: "0 0 420px", borderRadius: "18px", padding: "1.75rem", background: "#ffffff", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 800, color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "var(--radius-pill)" }}>
                  STAGE 02 // TOPOLOGY
                </span>
                <span style={{ fontSize: "0.72rem", color: "#8b8f87", fontWeight: 600 }}>NetworkX DiGraph</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#171916", margin: "0 0 0.5rem 0" }}>
                Directed Graph Construction
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#555951", lineHeight: 1.55, margin: "0 0 1rem 0" }}>
                Translates isolated host scans into a unified directed topological graph with weighted edge traversal difficulties.
              </p>
            </div>

            {/* Visual SVG Mini Graph */}
            <div style={{ background: "#f8f7f4", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(23, 25, 22, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "0.5rem", background: "#ffffff", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.1)", fontSize: "0.75rem", fontWeight: 700 }}>
                <div style={{ color: "#e11d48", fontSize: "0.65rem" }}>ENTRY</div>
                <span>INTERNET</span>
              </div>
              <span style={{ color: "var(--color-accent)", fontWeight: 800, fontSize: "1rem" }}>→</span>
              <div style={{ textAlign: "center", padding: "0.5rem", background: "#ffffff", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.1)", fontSize: "0.75rem", fontWeight: 700 }}>
                <div style={{ color: "#555951", fontSize: "0.65rem" }}>HOP 01</div>
                <span>web-lb-01</span>
              </div>
              <span style={{ color: "var(--color-accent)", fontWeight: 800, fontSize: "1rem" }}>→</span>
              <div style={{ textAlign: "center", padding: "0.5rem", background: "#ffffff", borderRadius: "8px", border: "1px solid rgba(234, 88, 12, 0.4)", fontSize: "0.75rem", fontWeight: 700 }}>
                <div style={{ color: "#ea580c", fontSize: "0.65rem" }}>CROWN</div>
                <span>db-prod-01</span>
              </div>
            </div>
          </motion.div>

          {/* Card 03: Yen's Solver */}
          <motion.div whileHover={{ y: -6 }} className="hml-horizontal-card" style={{ width: "420px", flex: "0 0 420px", borderRadius: "18px", padding: "1.75rem", background: "#ffffff", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 800, color: "#d97706", background: "rgba(217, 119, 6, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "var(--radius-pill)" }}>
                  STAGE 03 // SOLVER
                </span>
                <span style={{ fontSize: "0.72rem", color: "#8b8f87", fontWeight: 600 }}>Bounded Yen's K-Shortest</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#171916", margin: "0 0 0.5rem 0" }}>
                Bounded Yen's Path Solver
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#555951", lineHeight: 1.55, margin: "0 0 1rem 0" }}>
                Enumerates the top 5 shortest attack vectors per crown jewel (bounded at max 6 hops), avoiding exponential path explosion.
              </p>
            </div>

            {/* Visual Path Hierarchy */}
            <div style={{ background: "#0f110e", borderRadius: "12px", padding: "0.9rem 1rem", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#f2efe7", fontFamily: "var(--font-family-mono)", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ color: "#ff8598", fontWeight: 700 }}>#1 Shortest Path (88.0%)</span>
                <span style={{ color: "#a1a59c" }}>3 Hops</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fb923c", fontWeight: 700 }}>#2 Alternate Path (41.0%)</span>
                <span style={{ color: "#a1a59c" }}>4 Hops</span>
              </div>
            </div>
          </motion.div>

          {/* Card 04: Valuation */}
          <motion.div whileHover={{ y: -6 }} className="hml-horizontal-card" style={{ width: "420px", flex: "0 0 420px", borderRadius: "18px", padding: "1.75rem", background: "#ffffff", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 800, color: "#15803d", background: "rgba(21, 128, 61, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "var(--radius-pill)" }}>
                  STAGE 04 // VALUATION
                </span>
                <span style={{ fontSize: "0.72rem", color: "#8b8f87", fontWeight: 600 }}>Deterministic ($ USD)</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#171916", margin: "0 0 0.5rem 0" }}>
                Deterministic $ Valuation
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#555951", lineHeight: 1.55, margin: "0 0 1rem 0" }}>
                Applies mathematical risk valuation: Likelihood × Asset Value × Multiplier + Base Cost. Zero hallucinated numbers.
              </p>
            </div>

            {/* Visual Formula Box */}
            <div style={{ background: "#fff5f5", borderRadius: "12px", padding: "0.9rem 1rem", border: "1px solid rgba(225, 29, 72, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-family-mono)", color: "#e11d48", fontWeight: 700 }}>CALCULATED EXPOSURE</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e11d48" }}>$902,900</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", color: "#555951" }}>
                <div>0.88 × $500K</div>
                <div>+ $500K Base</div>
              </div>
            </div>
          </motion.div>

          {/* Card 05: Playbooks */}
          <motion.div whileHover={{ y: -6 }} className="hml-horizontal-card" style={{ width: "420px", flex: "0 0 420px", borderRadius: "18px", padding: "1.75rem", background: "#ffffff", border: "1px solid rgba(23, 25, 22, 0.12)", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 800, color: "#7c3aed", background: "rgba(124, 58, 237, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "var(--radius-pill)" }}>
                  STAGE 05 // REMEDIATION
                </span>
                <span style={{ fontSize: "0.72rem", color: "#8b8f87", fontWeight: 600 }}>NVIDIA NIM Guardrails</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#171916", margin: "0 0 0.5rem 0" }}>
                Defensive Playbook Synthesis
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#555951", lineHeight: 1.55, margin: "0 0 1rem 0" }}>
                Synthesizes contextual Ansible, Shell, or AWS CLI remediations with strict output-side offensive marker scanning.
              </p>
            </div>

            {/* Visual Code Box */}
            <div style={{ background: "#0f110e", borderRadius: "12px", padding: "0.9rem 1rem", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#f2efe7", fontFamily: "var(--font-family-mono)", fontSize: "0.72rem" }}>
              <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: "0.2rem" }}>✓ DEFENSIVE PLAYBOOK READY</div>
              <div style={{ color: "#a1a59c" }}>ansible-playbook -i hosts patch-cve.yml</div>
            </div>
          </motion.div>
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
  const [copied, setCopied] = useState(false);

  const files = {
    ansible: {
      name: "harden_cve_2024_4321.yml",
      lang: "yaml",
      target: "PostgreSQL Database (10.0.0.5:5432)",
      cve: "CVE-2024-4321",
      lines: [
        "- name: Remediate PostgreSQL Privilege Escalation (CVE-2024-4321)",
        "  hosts: databases",
        "  become: yes",
        "  tasks:",
        "    - name: Patch postgresql-16 package to latest stable",
        "      apt:",
        "        name: postgresql-16",
        "        state: latest",
        "        update_cache: yes",
        "    - name: Enforce strict scram-sha-256 in pg_hba.conf",
        "      lineinfile:",
        "        path: /etc/postgresql/16/main/pg_hba.conf",
        "        regexp: '^host.*all.*all'",
        "        line: 'host all all 10.0.0.0/24 scram-sha-256'",
        "    - name: Restart PostgreSQL service",
        "      service:",
        "        name: postgresql",
        "        state: restarted",
      ],
    },
    shell: {
      name: "harden_perimeter_ingress.sh",
      lang: "bash",
      target: "Edge Gateway (192.168.1.1)",
      cve: "Perimeter Exposure",
      lines: [
        "#!/usr/bin/env bash",
        "# Drishti Automated Perimeter Hardening Script",
        "set -euo pipefail",
        "",
        "echo '[*] Applying iptables ingress rules to isolate database tier...'",
        "iptables -A INPUT -p tcp --dport 5432 ! -s 10.0.0.0/24 -j DROP",
        "iptables -A INPUT -p tcp --dport 22 ! -s 192.168.1.0/24 -j DROP",
        "",
        "# Save persistent iptables state",
        "iptables-save > /etc/iptables/rules.v4",
        "echo '[+] Ingress rules applied. Direct internet access blocked.'",
      ],
    },
    aws: {
      name: "aws_security_group_remediation.sh",
      lang: "bash",
      target: "AWS VPC Security Group (sg-0123456789abcdef0)",
      cve: "Overly Permissive Ingress",
      lines: [
        "# AWS CLI Security Group Remediation for Crown Jewel DB",
        "aws ec2 revoke-security-group-ingress \\",
        "    --group-id sg-0123456789abcdef0 \\",
        "    --protocol tcp \\",
        "    --port 5432 \\",
        "    --cidr 0.0.0.0/0",
        "",
        "aws ec2 authorize-security-group-ingress \\",
        "    --group-id sg-0123456789abcdef0 \\",
        "    --protocol tcp \\",
        "    --port 5432 \\",
        "    --source-security-group-id sg-0987654321fedcba0 \\",
        "    --group-owner 123456789012",
      ],
    },
  };

  const current = files[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Terminal Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        style={{
          borderRadius: "16px",
          background: "#0f110e",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Terminal Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.85rem 1.25rem",
            background: "#181a17",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* macOS window dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
            </div>
            <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-family-mono)", color: "#a1a59c", fontWeight: 600 }}>
              {current.name}
            </span>
          </div>

          {/* Interactive Format Switcher Tabs */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setActiveTab("ansible")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: activeTab === "ansible" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.06)",
                color: activeTab === "ansible" ? "#ffffff" : "#a1a59c",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.78rem",
                transition: "all 0.2s ease",
              }}
            >
              Ansible Playbook
            </button>
            <button
              onClick={() => setActiveTab("shell")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: activeTab === "shell" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.06)",
                color: activeTab === "shell" ? "#ffffff" : "#a1a59c",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.78rem",
                transition: "all 0.2s ease",
              }}
            >
              Shell Script
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: activeTab === "aws" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.06)",
                color: activeTab === "aws" ? "#ffffff" : "#a1a59c",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.78rem",
                transition: "all 0.2s ease",
              }}
            >
              AWS CLI
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "6px",
              background: copied ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.08)",
              border: `1px solid ${copied ? "#22c55e" : "rgba(255, 255, 255, 0.12)"}`,
              color: copied ? "#4ade80" : "#f2efe7",
              fontSize: "0.75rem",
              fontFamily: "var(--font-family-mono)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>

        {/* Target Asset Meta Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.6rem 1.5rem",
            background: "rgba(234, 88, 12, 0.06)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.75rem",
            fontFamily: "var(--font-family-mono)",
            color: "#c5c2ba",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <span style={{ color: "#fb923c", fontWeight: 700 }}>TARGET: </span>
            <span>{current.target}</span>
          </div>
          <div>
            <span style={{ color: "#ff8598", fontWeight: 700 }}>MITIGATES: </span>
            <span>{current.cve}</span>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div
          style={{
            padding: "1.5rem",
            fontFamily: "var(--font-family-mono)",
            fontSize: "0.86rem",
            lineHeight: 1.7,
            color: "#f2efe7",
            overflowX: "auto",
          }}
        >
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {current.lines.map((line, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      width: "35px",
                      userSelect: "none",
                      color: "#555951",
                      textAlign: "right",
                      paddingRight: "1.25rem",
                      fontSize: "0.75rem",
                      verticalAlign: "top",
                    }}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </td>
                  <td style={{ whiteSpace: "pre", color: line.startsWith("#") ? "#6b7280" : line.includes("name:") || line.includes("hosts:") ? "#fb923c" : line.includes("echo") ? "#4ade80" : "#f2efe7" }}>
                    {line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verified Guardrail Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.6rem 1.5rem",
            background: "#141613",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.72rem",
            fontFamily: "var(--font-family-mono)",
            color: "#8b8f87",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#4ade80" }}>●</span>
            <span>NVIDIA NIM (Llama 3.3 70B) Defensive Filter: ACTIVE</span>
          </div>
          <span>0 Offensive Markers · Verified Defensive Remediation</span>
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
      num: "01",
      q: "How does Drishti calculate financial dollar exposure?",
      badge: "MATHEMATICAL ENGINE",
      a: "Drishti uses a deterministic mathematical formula: Path Impact = Likelihood × Target Asset Business Value × Asset Multiplier + Likelihood × Breach Base Cost. The total exposure sums the maximum impact per unique crown jewel across all bounded paths, ensuring no double-counting.",
      widget: (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(234, 88, 12, 0.06)", borderRadius: "10px", border: "1px solid rgba(234, 88, 12, 0.18)", fontFamily: "var(--font-family-mono)", fontSize: "0.8rem", color: "#171916" }}>
          <div style={{ color: "var(--color-accent)", fontWeight: 700, marginBottom: "0.3rem" }}>FORMULA SPECIFICATION:</div>
          <code style={{ display: "block", color: "#171916", fontWeight: 600 }}>
            Exposure = Σ max(Likelihood × Asset_Value × Multiplier + Base_Cost)
          </code>
          <div style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "#6b7280" }}>
            Deterministic across runs · Zero statistical drift · Board-ready ($ USD) metrics
          </div>
        </div>
      ),
    },
    {
      num: "02",
      q: "How does Drishti ensure AI safety and prevent exploit generation?",
      badge: "NVIDIA NIM GUARDRAILS",
      a: "All LLM completions pass through a strict output-side scanner that checks for offensive markers ('reverse shell', 'weaponize', 'exfiltrate', 'ransomware'). If an offensive pattern is detected, the completion is refused immediately. The AI is strictly restricted to defensive remediation and explanation.",
      widget: (
        <div style={{ marginTop: "1rem", padding: "0.85rem 1.1rem", background: "#0f110e", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)", fontFamily: "var(--font-family-mono)", fontSize: "0.75rem", color: "#f2efe7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4ade80", fontWeight: 700, marginBottom: "0.3rem" }}>
            <span>●</span>
            <span>SCANNER VERDICT: DEFENSIVE ONLY</span>
          </div>
          <div style={{ color: "#a1a59c" }}>
            Offensive Exploit Generation Blocked · Remediation Verification: PASS (100%)
          </div>
        </div>
      ),
    },
    {
      num: "03",
      q: "Can Drishti scan arbitrary public IP addresses?",
      badge: "SCOPE ENFORCEMENT",
      a: "No. Drishti enforces strict RFC1918 private address verification and requires explicit 'consent: true' in request payloads. Scans targeting public IPs, AWS metadata endpoints (169.254.169.254), or unauthorized subnets are rejected with HTTP 422.",
      widget: (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", background: "rgba(21, 128, 61, 0.1)", border: "1px solid rgba(21, 128, 61, 0.25)", color: "#15803d", fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>
            ✓ 10.0.0.0/8 (RFC1918)
          </span>
          <span style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", background: "rgba(21, 128, 61, 0.1)", border: "1px solid rgba(21, 128, 61, 0.25)", color: "#15803d", fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>
            ✓ 172.16.0.0/12 (RFC1918)
          </span>
          <span style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", background: "rgba(21, 128, 61, 0.1)", border: "1px solid rgba(21, 128, 61, 0.25)", color: "#15803d", fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>
            ✓ 192.168.0.0/16 (RFC1918)
          </span>
          <span style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", background: "rgba(225, 29, 72, 0.1)", border: "1px solid rgba(225, 29, 72, 0.25)", color: "#e11d48", fontSize: "0.75rem", fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>
            ✗ Public IPs Blocked (HTTP 422)
          </span>
        </div>
      ),
    },
    {
      num: "04",
      q: "What database backends are supported?",
      badge: "STORAGE ARCHITECTURE",
      a: "Drishti supports PostgreSQL with transactional advisory locks for enterprise production, and local SQLite for development. All entity models use 36-character UUID strings for seamless portability across environments.",
      widget: (
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{ padding: "0.75rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.08)" }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-family-mono)", fontWeight: 700, color: "var(--color-accent)" }}>ENTERPRISE PROD</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#171916" }}>PostgreSQL + Advisory Locks</div>
          </div>
          <div style={{ padding: "0.75rem", background: "var(--color-surface-base)", borderRadius: "8px", border: "1px solid rgba(23, 25, 22, 0.08)" }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-family-mono)", fontWeight: 700, color: "#555951" }}>LOCAL DEV</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#171916" }}>SQLite (AIOSQLite Async)</div>
          </div>
        </div>
      ),
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

      <div className="hml-faq-list" style={{ maxWidth: "56rem", marginInline: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {faqs.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{
                borderRadius: "14px",
                background: "#ffffff",
                border: `1px solid ${isOpen ? "rgba(234, 88, 12, 0.35)" : "rgba(23, 25, 22, 0.1)"}`,
                boxShadow: isOpen ? "0 10px 30px rgba(234, 88, 12, 0.08)" : "0 2px 10px rgba(23, 25, 22, 0.03)",
                overflow: "hidden",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <button
                className="hml-faq-trigger"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: isOpen ? "var(--color-accent)" : "rgba(23, 25, 22, 0.06)",
                      color: isOpen ? "#ffffff" : "#171916",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {f.num}
                  </span>
                  <div>
                    <span style={{ fontSize: "1.08rem", fontWeight: 800, color: "#171916", letterSpacing: "-0.015em" }}>
                      {f.q}
                    </span>
                    <span style={{ display: "block", fontSize: "0.68rem", fontFamily: "var(--font-family-mono)", color: "#8b8f87", fontWeight: 700, marginTop: "0.2rem", letterSpacing: "0.04em" }}>
                      {f.badge}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: isOpen ? "rgba(234, 88, 12, 0.1)" : "rgba(23, 25, 22, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                      color: isOpen ? "var(--color-accent)" : "#555951",
                    }}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 1.5rem 1.5rem 1.5rem", borderTop: "1px solid rgba(23, 25, 22, 0.06)", paddingTop: "1.25rem" }}>
                      <p style={{ margin: 0, color: "#555951", fontSize: "0.95rem", lineHeight: 1.65 }}>
                        {f.a}
                      </p>
                      {f.widget}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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
