// Drishti v0.3 — public marketing landing page
/** Hallmark redesign — genre: atmospheric · macrostructure: Map / Diagram ·
 * theme: Midnight (warm-amber dark paper, signal-orange accent) · nav: N5
 * floating pill · footer: Ft5 statement. The attack-path graph IS the page:
 * a hand-built, interactive SVG network map anchors the hero — a k=1/2/3
 * switcher re-threads Yen's k-shortest paths through the same nodes and the
 * dollar exposure recomputes from the formula shown on screen (sample
 * network, deterministic — never asserted, always derived).
 * Motion stays at three primitives: node ink-on, dash-flow on the active
 * path, CTA lift. All CSS — framer-motion is not part of this chunk.
 */
import { ChevronDown, Menu, X } from "lucide-react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth";
import "./landing.css";
import "./landing-cinema.css";
import heroBg from "../../assets/hero-bg.jpg";

export default function Landing() {
  const { user } = useAuth();
  const rootRef = useReveal();
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="hml" ref={rootRef}>
      <TopStrip />
      <Nav />
      <main>
        <Hero />
        <Insight />
        <SpecSheet />
        <Intelligence />
        <Pipeline />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------------------------------------- scroll-reveal plumbing */

/** Adds .is-in to every [data-rv] descendant the first time it scrolls
 * into view. CSS owns the actual motion (and reduced-motion opt-out). */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Delay helper for staggered reveals. */
function rv(ms = 0): { "data-rv": ""; style: CSSProperties } {
  return { "data-rv": "", style: { "--rvd": `${ms}ms` } as CSSProperties };
}

/* ------------------------------------------------- system status strip */

function TopStrip() {
  const [utc, setUtc] = useState(() => new Date().toISOString().slice(11, 19));
  useEffect(() => {
    const id = setInterval(
      () => setUtc(new Date().toISOString().slice(11, 19)),
      1000
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hml-strip" aria-hidden>
      <span>
        DRISHTI <em>//</em> DEFENSIVE GRAPH ENGINE
      </span>
      <span className="hml-strip__mid">SAMPLE NETWORK · DETERMINISTIC MATH</span>
      <span>
        <span className="hml-strip__dot" /> UTC {utc}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------- nav (N5) */

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#pricing", label: "Pricing" },
];

function Wordmark() {
  return (
    <>
      dr<em>i</em>shti
    </>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="hml-nav"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <nav className="hml-nav__pill" aria-label="Main">
        <Link to="/" className="hml-nav__mark">
          <Wordmark />
        </Link>
        <div className="hml-nav__links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <Link to="/login">Sign in</Link>
        </div>
        <Link to="/signup" className="hml-btn hml-btn--sm">
          Start free
        </Link>
        <button
          type="button"
          className="hml-nav__menu-btn"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {open && (
          <div className="hml-nav__sheet">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ------------------------------------------------ hero — the map is the page */

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 2, y: y * 2 });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      className="hml-hero"
      id="top"
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hml-hero__backdrop" aria-hidden>
        <div
          className="hml-hero__backdrop-inner"
          style={
            {
              "--tilt-x": tilt.x.toFixed(3),
              "--tilt-y": tilt.y.toFixed(3),
            } as CSSProperties
          }
        >
          <img
            src={heroBg}
            alt=""
            width={1200}
            height={675}
            {...{ fetchpriority: "high" }}
          />
          {/* film grain — static noise over the footage, sits above the frame */}
          <div className="hml-hero__grain" />
          {/* anamorphic streak flare */}
          <div className="hml-hero__flare" />
          {/* full-height laser scanline that sweeps the screen */}
          <div className="hml-hero__laser" />
          <div className="hml-hero__hud">
            <div className="hml-hero__reticle" />
            <div className="hml-hero__telemetry">
              <span>DRISHTI_CAM // 01</span>
              <span>LAT 37.7749 · LON -122.4194</span>
              <span>TARGET: EYE_IRIS_01</span>
              <span>LOCK: ACTIVE (100%)</span>
            </div>
            <div className="hml-hero__timecode" id="hml-tc">
              TC 00:00:00:00
            </div>
          </div>
        </div>
      </div>
      {/* cinematic letterbox — fixed to the viewport frame, pushes the whole
       * composition into 2.39:1 while the hero owns the screen */}
      <div className="hml-hero__bar hml-hero__bar--top" aria-hidden />
      <div className="hml-hero__bar hml-hero__bar--bot" aria-hidden />
      {/* film clapper opening — two bars achieve in from frame edges, then fade */}
      <div className="hml-hero__clap" aria-hidden>
        <div className="hml-hero__clap-top" />
        <div className="hml-hero__clap-bot" />
      </div>
      <div className="hml-wrap">
        <p className="hml-hero__route">
          INTERNET → web-lb-01 → api-gw-01 → <strong>db-prod-01</strong> ={" "}
          <strong>${heroExposure()}</strong> · sample chain, priced
        </p>
        <h1 className="hml-hero__title">Reachability beats CVSS.</h1>
        <p className="hml-hero__lede">
          Pure graph theory maps every route an attacker could take, prices the
          blast radius in deterministic dollars, and defensive AI drafts the
          fix.
        </p>
        <div className="hml-hero__actions">
          <Link to="/signup" className="hml-btn">
            Start free
          </Link>
          <Link to="/login" className="hml-link-cta">
            Sign in →
          </Link>
        </div>

        <AttackMap />

        <p className="hml-hero__facts">
          <span>$0 hallucinated math</span>
          <span>1-file edge agent</span>
          <span>defensive-only — maps, never attacks</span>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------- the map — Yen's k-shortest, live */

// Sample-network constants. Every dollar figure on the page is DERIVED from
// these on screen (likelihood × asset value) — never asserted.
const ASSET_VALUE = 150_000;

type MapNode = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  i: number;
  crown?: boolean;
};

const MAP_NODES: MapNode[] = [
  { x: 40, y: 42, w: 150, h: 64, label: "INTERNET", sub: "entry point", i: 0 },
  { x: 250, y: 150, w: 176, h: 64, label: "web-lb-01", sub: "DMZ · exposed", i: 2 },
  { x: 510, y: 252, w: 176, h: 64, label: "api-gw-01", sub: "app tier", i: 4 },
  { x: 210, y: 372, w: 176, h: 64, label: "svc-auth-02", sub: "app tier", i: 6 },
  { x: 660, y: 84, w: 160, h: 64, label: "worker-07", sub: "batch tier", i: 6 },
  { x: 724, y: 430, w: 196, h: 76, label: "db-prod-01", sub: "data tier · crown asset", i: 6, crown: true },
];

const NODE_SUB: Record<string, string> = Object.fromEntries(
  MAP_NODES.map((n) => [n.label, n.sub])
);

type MapEdge = { id: string; d: string; tag: string; tx: number; ty: number; i: number };

const MAP_EDGES: MapEdge[] = [
  { id: "e1", d: "M 190 78 Q 270 92 328 148", tag: "exposure", tx: 232, ty: 66, i: 1 },
  { id: "e2", d: "M 426 186 Q 510 210 586 250", tag: "ssrf pivot", tx: 462, ty: 178, i: 3 },
  { id: "e3", d: "M 686 292 Q 780 330 816 428", tag: "priv-esc", tx: 748, ty: 316, i: 5 },
  { id: "e4", d: "M 336 214 Q 310 290 298 370", tag: "default creds", tx: 196, ty: 300, i: 6 },
  { id: "e5", d: "M 386 404 Q 560 452 722 470", tag: "token replay", tx: 520, ty: 466, i: 6 },
  { id: "e6", d: "M 604 252 Q 660 200 736 150", tag: "lateral move", tx: 596, ty: 190, i: 6 },
  { id: "e7", d: "M 745 148 Q 800 290 824 428", tag: "cron creds", tx: 812, ty: 262, i: 6 },
];

type KPath = {
  k: 1 | 2 | 3;
  name: string;
  hops: string[];
  tags: string[];
  edges: string[];
  likelihood: number;
};

const K_PATHS: KPath[] = [
  {
    k: 1,
    name: "shortest",
    hops: ["INTERNET", "web-lb-01", "api-gw-01", "db-prod-01"],
    tags: ["exposure", "ssrf pivot", "priv-esc"],
    edges: ["e1", "e2", "e3"],
    likelihood: 0.72,
  },
  {
    k: 2,
    name: "alternate",
    hops: ["INTERNET", "web-lb-01", "svc-auth-02", "db-prod-01"],
    tags: ["exposure", "default creds", "token replay"],
    edges: ["e1", "e4", "e5"],
    likelihood: 0.41,
  },
  {
    k: 3,
    name: "residual",
    hops: ["INTERNET", "web-lb-01", "api-gw-01", "worker-07", "db-prod-01"],
    tags: ["exposure", "ssrf pivot", "lateral move", "cron creds"],
    edges: ["e1", "e2", "e6", "e7"],
    likelihood: 0.18,
  },
];

function exposureOf(p: KPath) {
  return Math.round(p.likelihood * ASSET_VALUE).toLocaleString("en-US");
}

function heroExposure() {
  return exposureOf(K_PATHS[0]);
}

function AttackMap() {
  const [k, setK] = useState<1 | 2 | 3>(1);
  const [spot, setSpot] = useState<string | null>(null);
  const [boot, setBoot] = useState(true);
  const figRef = useRef<HTMLElement>(null);

  // the ink-on reveal runs once; after it ends, drop the boot attribute so
  // re-classing edges on a k-switch never replays the staggered delays
  useEffect(() => {
    const t = setTimeout(() => setBoot(false), 1100);
    return () => clearTimeout(t);
  }, []);

  // pause the dash-flow paint work while the map is off-screen
  useEffect(() => {
    const fig = figRef.current;
    if (!fig || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      fig.toggleAttribute("data-idle", !entry.isIntersecting);
    });
    io.observe(fig);
    return () => io.disconnect();
  }, []);

  const path = K_PATHS[k - 1];
  const activeEdges = new Set(path.edges);
  const activeNodes = new Set(path.hops);

  return (
    <figure
      className="hml-map hml-grain"
      ref={figRef}
      {...(boot ? { "data-boot": "" } : {})}
    >
      <div className="hml-map__bar">
        <span className="hml-map__bar-label">
          Yen’s k-shortest · {path.hops.length - 1} hops · {path.name} route
        </span>
        <div className="hml-map__k" role="group" aria-label="Attack path rank">
          {K_PATHS.map((p) => (
            <button
              key={p.k}
              type="button"
              aria-pressed={k === p.k}
              className={k === p.k ? "is-on" : undefined}
              onClick={() => setK(p.k)}
            >
              k={p.k}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 960 560"
        role="img"
        aria-label={`Network graph, sample assessment. Attack path k=${k}: ${path.hops.join(
          " to "
        )}.`}
        className={spot ? "is-spotlit" : undefined}
      >
        {MAP_EDGES.map((e) => (
          <path
            key={e.id}
            className={`hml-map__edge${activeEdges.has(e.id) ? " is-attack" : ""}`}
            d={e.d}
            style={{ "--i": e.i } as CSSProperties}
          />
        ))}
        {MAP_EDGES.map((e) => (
          <text
            key={`${e.id}-tag`}
            className={`hml-map__edge-tag${activeEdges.has(e.id) ? " is-on" : ""}`}
            x={e.tx}
            y={e.ty}
            style={{ "--i": e.i } as CSSProperties}
          >
            {e.tag}
          </text>
        ))}
        {MAP_NODES.map((n) => {
          const onPath = activeNodes.has(n.label);
          return (
            <g
              key={n.label}
              className={`hml-map__node${onPath ? " hml-map__node--path" : ""}${
                n.crown ? " hml-map__node--crown" : ""
              }${spot === n.label ? " is-active" : ""}`}
              style={{ "--i": n.i } as CSSProperties}
              tabIndex={0}
              role="img"
              aria-label={`${n.label} — ${n.sub}`}
              onMouseEnter={() => setSpot(n.label)}
              onMouseLeave={() => setSpot(null)}
              onFocus={() => setSpot(n.label)}
              onBlur={() => setSpot(null)}
            >
              {n.crown && (
                <rect
                  className="hml-map__crown-ring"
                  x={n.x - 6}
                  y={n.y - 6}
                  width={n.w + 12}
                  height={n.h + 12}
                  rx={12}
                />
              )}
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} />
              {onPath && !n.crown && (
                <circle
                  className="hml-map__dot"
                  cx={n.x + n.w - 16}
                  cy={n.y + 16}
                  r={3.5}
                />
              )}
              <text className="hml-map__label" x={n.x + 16} y={n.y + 28}>
                {n.label}
              </text>
              <text className="hml-map__sub" x={n.x + 16} y={n.y + 47}>
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>

      {/* compact chain replaces the SVG below 48rem — follows the selected k */}
      <div className="hml-chain">
        {path.hops.map((h, idx) => (
          <Fragment key={h}>
            {idx > 0 && (
              <div className="hml-chain__hop" aria-hidden>
                ↓ {path.tags[idx - 1]}
              </div>
            )}
            <div
              className={`hml-chain__node${
                h === "db-prod-01" ? " hml-chain__node--crown" : ""
              }`}
            >
              <span>{h}</span>
              <span className="hml-muted">{NODE_SUB[h]}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <figcaption className="hml-map__legend">
        <span className="hml-map__readout">
          likelihood {path.likelihood.toFixed(2)} × $
          {ASSET_VALUE.toLocaleString("en-US")} ={" "}
          <strong>${exposureOf(path)}</strong> · sample network
        </span>
        <span>
          <span className="swatch" aria-hidden /> active attack path
        </span>
        <span>
          <span className="swatch swatch--node" aria-hidden /> asset node
        </span>
        <Link to="/signup" className="hml-chip-cta">
          Load the sample network →
        </Link>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------- insight ledger */

function Insight() {
  return (
    <section className="hml-insight" id="insight">
      <div className="hml-wrap">
        <div className="hml-insight__head" {...rv()}>
          <h2>A medium bug on the edge beats a critical bug in the vault.</h2>
          <p>
            A CVSS 9.8 buried three firewalls deep and unreachable is a paper
            tiger. A CVSS 5.3 on your exposed load balancer is the front door.
            Drishti ranks by the path, not the number.
          </p>
        </div>
        <p className="mono hml-muted hml-insight__caption" {...rv(80)}>
          worked example · sample assessment
        </p>
        <div className="hml-ledger">
          <div className="hml-ledger__col" {...rv(120)}>
            <h3>Ranked by CVSS alone</h3>
            <LedgerRow rank="1" host="db-vault-09" note="CVSS 9.8 · unreachable" />
            <LedgerRow rank="2" host="web-lb-01" note="CVSS 5.3 · internet-facing" />
            <p className="hml-ledger__verdict">
              You patch the vault first and leave the open front door for last.
            </p>
          </div>
          <div className="hml-ledger__col hml-ledger__col--right" {...rv(240)}>
            <h3>Ranked by reachability</h3>
            <LedgerRow rank="1" host="web-lb-01" note="1 hop from INTERNET · priced" hot />
            <LedgerRow rank="2" host="db-vault-09" note="0 paths in · contained" />
            <p className="hml-ledger__verdict">
              You break the reachable chain first — the one an attacker
              actually walks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LedgerRow({ rank, host, note, hot }: { rank: string; host: string; note: string; hot?: boolean }) {
  return (
    <div className={`hml-ledger__row${hot ? " hml-ledger__row--hot" : ""}`}>
      <span className="hml-ledger__rank">{rank}</span>
      <span className="hml-ledger__host">{host}</span>
      <span className="hml-ledger__note">{note}</span>
    </div>
  );
}

/* ------------------------------------------------------ spec sheet (F3) */

const SPEC_ROWS = [
  {
    name: "Graph reachability",
    mech: "Yen’s k-shortest",
    note: "Vulnerabilities scored on actual network reachability — real routes, not a flat CVE list.",
  },
  {
    name: "Dollar exposure",
    mech: "deterministic",
    note: "Every attack path gets a verifiable figure from likelihood and asset value. Same math every run.",
  },
  {
    name: "Defensive remediation",
    mech: "Groq LLM",
    note: "One click drafts an Ansible or CLI fix. The AI explains the math and writes the script — never invents numbers.",
  },
  {
    name: "Edge filtering",
    mech: "1-file agent",
    note: "A single-file Python agent drops low-severity noise at the source before it reaches your workspace.",
  },
];

function SpecSheet() {
  return (
    <section className="hml-spec" id="product">
      <div className="hml-wrap">
        <h2 {...rv()}>Math over vibes.</h2>
        <p className="hml-muted" {...rv(80)}>
          Everything on screen is deterministically computed from your
          network’s graph — no canned scores, no hallucinated metrics.
        </p>
        <table className="hml-spec__table" {...rv(160)}>
          <tbody>
            {SPEC_ROWS.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                <td className="mech">{r.mech}</td>
                <td className="note">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* -------------------------------------------------- intelligence layer */

const INTEL = [
  {
    title: "Executive threat narrative",
    tag: "Groq LLM",
    copy: "One click turns the whole assessment into a board-ready summary — systemic risks and priority actions, grounded in real findings, never invented.",
  },
  {
    title: "Node hardening plan",
    tag: "engine-grounded",
    copy: "Per-node fixes with measured risk drops. The engine re-runs with each change applied and reports the actual reduction.",
  },
  {
    title: "ML anomaly + segmentation",
    tag: "scikit-learn",
    copy: "IsolationForest flags outlier assets against the fleet’s profile; KMeans clusters the network into security segments labelled by mean risk.",
  },
  {
    title: "Aggregated CVE intelligence",
    tag: "real data",
    copy: "Every open finding rolled up by CVE — CVSS, severity, and the exact hosts affected — sorted so the highest-leverage patch is always on top.",
  },
];

function Intelligence() {
  return (
    <section className="hml-intel">
      <div className="hml-wrap">
        <h2 {...rv()}>Not just a graph — a full assessment report.</h2>
        <div className="hml-intel__grid" onPointerMove={spotlightCard}>
          {INTEL.map((it, idx) => (
            <article
              key={it.title}
              className="hml-intel__card"
              {...rv(80 + idx * 90)}
            >
              <span className="hml-intel__idx">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3>{it.title}</h3>
              <span className="hml-intel__tag">{it.tag}</span>
              <p>{it.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Feeds the CSS cursor-spotlight (--mx/--my) on the hovered intel card. */
function spotlightCard(e: ReactPointerEvent<HTMLDivElement>) {
  const card = (e.target as HTMLElement).closest<HTMLElement>(
    ".hml-intel__card"
  );
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/* ------------------------------------------------------- pipeline (F4) */

const STAGES = [
  {
    n: "01",
    title: "Collect & filter",
    copy: "The one-file edge agent gathers host, service, and vulnerability metadata — and drops the noise before it leaves the machine.",
  },
  {
    n: "02",
    title: "Ingest & model",
    copy: "Snapshots land in your workspace and construct a living directed graph of assets.",
  },
  {
    n: "03",
    title: "Analyze & value",
    copy: "The risk engine computes bounded attack paths and prices each path in real dollars.",
  },
  {
    n: "04",
    title: "Visualize & fix",
    copy: "Watch the blast radius, open the costliest path, and use defensive AI to fix it.",
  },
];

function Pipeline() {
  return (
    <section className="hml-pipe" id="pipeline">
      <div className="hml-wrap">
        <h2 {...rv()}>From raw scan to reviewed fix.</h2>
        <ol>
          {STAGES.map((s, idx) => (
            <li key={s.n} {...rv(idx * 110)}>
              <span className="hml-pipe__n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- faq */

const FAQS = [
  {
    q: "How is this different from a vulnerability scanner?",
    a: "A scanner hands you a flat list of CVEs sorted by CVSS. Drishti builds a directed graph of your network and scores each weakness by whether an attacker can actually reach it from the internet — then prices the blast radius in dollars.",
  },
  {
    q: "Are the risk scores and dollar figures real or made up?",
    a: "Deterministic. Node risk, path likelihood, and dollar exposure all come from one transparent formula over your graph — the same math every time. The AI explains the numbers; it never invents them.",
  },
  {
    q: "Where does the AI fit — and is it safe?",
    a: "The AI drafts defensive remediation and writes the executive summary, grounded in your real asset context. It is hard-guardrailed to refuse offensive queries.",
  },
];

function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="hml-faq">
      <div className="hml-wrap">
        <h2 {...rv()}>Frequently asked.</h2>
        <div className="hml-faq__list" {...rv(80)}>
          {FAQS.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={f.q}
                className={`hml-faq__item${isOpen ? " is-open" : ""}`}
              >
                <button
                  type="button"
                  className="hml-faq__btn"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{f.q}</span>
                  <ChevronDown className="hml-faq__chevron h-5 w-5" />
                </button>
                {isOpen && <div className="hml-faq__answer">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- cta band */

function CtaBand() {
  return (
    <section className="hml-cta" id="pricing">
      <div className="hml-wrap">
        <div className="hml-cta__inner hml-grain" {...rv()}>
          <h2>Free to start.</h2>
          <p>
            Create a workspace, load the sample assessment or connect your own
            network, and walk the full flow — no card, no trial clock.
          </p>
          <Link to="/signup" className="hml-btn">
            Create a workspace
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- footer (Ft5) */

function Footer() {
  return (
    <footer className="hml-foot">
      <span className="hml-foot__ghost" aria-hidden>
        DRISHTI
      </span>
      <div className="hml-wrap">
        <p className="hml-foot__statement">
          Drishti maps and prices risk. It never <em>attacks</em>.
        </p>
        <div className="hml-foot__meta">
          <span className="hml-nav__mark">
            <Wordmark />
          </span>
          <span>dṛṣṭi · Sanskrit for sight</span>
          <a href="#product">Product</a>
          <a href="#pipeline">Pipeline</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Sign in</Link>
          <span>© 2026 Drishti</span>
        </div>
      </div>
    </footer>
  );
}
