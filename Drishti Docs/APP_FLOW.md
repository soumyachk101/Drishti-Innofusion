# Drishti — Application Flows

*Reverse-engineered end-to-end journeys and data flows, as Mermaid sequence/flow diagrams. Each maps to
real routes ([API_REFERENCE.md](API_REFERENCE.md)) and services.*

---

## 0. Navigation map

```mermaid
flowchart LR
    landing["/ Landing"] --> login["/login"]
    login --> home["/app (AppHome)"]
    home --> graph["/app/graph<br/>Attack Map"]
    home --> live["/app/live<br/>Live Watch"]
    home --> paths["/app/paths → /app/paths/:id"]
    home --> find["/app/findings"]
    home --> assets["/app/assets → /app/assets/:id"]
    home --> report["/app/report"]
    home --> url["/app/url-analyzer"]
    find --> remed["/app/remediate/:findingId"]
    home --> settings["/app/settings"]
```

Any `/app/*` URL without a session redirects to `/login` (`RequireAuth`).

---

## 1. Auth: register → login → refresh

```mermaid
sequenceDiagram
    participant U as Browser
    participant API as FastAPI
    participant DB as DB
    U->>API: POST /api/auth/register {name,email,password}
    API->>DB: create Org + User (bcrypt hash, role=analyst)
    API-->>U: 201 {user}
    U->>API: POST /api/auth/login {email,password}
    Note over API: verify vs bcrypt hash;<br/>if email unknown, verify DUMMY hash<br/>(timing-safe, no account-existence leak)
    API-->>U: 200 {access_token (15m), refresh_token (7d)}
    U->>API: GET /api/auth/me  (Bearer access)
    API-->>U: {id,email,role,org_name}
    Note over U,API: access expires →
    U->>API: POST /api/auth/refresh (Bearer refresh)
    Note over API: token_version must match user.token_version
    API-->>U: new {access, refresh}
```

**Token invalidation:** `PATCH /api/auth/me` with a new password bumps `user.token_version`; every token
minted earlier (which embeds the old version) then fails the `get_current_user` check — all sessions
logged out at once.

---

## 2. Ingest → recompute → visualize (the core loop)

```mermaid
sequenceDiagram
    participant A as Edge Agent
    participant API as /api/ingest
    participant ING as ingest service
    participant RC as recompute_org
    participant ENG as Risk Engine (pure)
    participant DB as DB
    participant W as Web SPA

    A->>API: POST /api/ingest (agent token)<br/>{host, services, vulns, connectivity}
    API->>ING: validate + org_slug match
    ING->>DB: upsert asset (org,ip) · replace services<br/>upsert findings · reconcile stale → resolved
    ING->>RC: recompute_org(org)
    RC->>ENG: load_engine → build DiGraph (INTERNET + assets)
    ENG-->>RC: node scores, blast radius
    ENG-->>RC: top-K attack paths (Yen), likelihood
    RC->>DB: cache risk_score, blast_radius_count,<br/>attack_paths + steps, impact_usd
    RC-->>API: stats {nodes,edges,paths,recompute_ms}
    API-->>A: 202 {asset_id, ingested counts}
    W->>API: GET /api/graph · /paths · /dashboard
    API-->>W: derived graph + $ exposure
```

---

## 3. The hero: resolve a finding → exposure drops live

```mermaid
sequenceDiagram
    participant U as Analyst
    participant W as Web SPA
    participant API as API
    participant RC as recompute_org
    participant DB as DB

    U->>W: open Findings, pick the PostgreSQL priv-esc
    W->>API: GET /api/ai/remediate? (or POST) finding_id, kind=ansible
    API-->>W: reviewed Ansible playbook (AI or template)<br/>marked "review before running"
    Note over U: human applies the fix in ops, then:
    U->>W: mark finding resolved
    W->>API: PATCH /api/findings/{id} {status:"resolved"}
    API->>DB: finding.status = resolved, resolved_at set
    API->>RC: recompute_org(org)
    Note over RC: resolved vuln → higher edge weight →<br/>lower path likelihood → lower impact_usd
    RC->>DB: rewrite paths + impacts
    W->>API: GET /api/dashboard
    API-->>W: total exposure $902,900 → $702,900
    Note over W: the number moves because the math is real
```

`make smoke` runs exactly this and asserts the `$200,000` drop.

---

## 4. Attack Map interaction + demo attack

```mermaid
sequenceDiagram
    participant U as User
    participant W as Attack Map (React Flow)
    participant API as API

    W->>API: GET /api/graph
    API-->>W: nodes (INTERNET→gateway→assets+live devices),<br/>edges (weights, on_top_path), threat overlays
    U->>W: click asset node
    W-->>U: asset drawer (services, findings, blast radius)
    U->>W: click edge
    W->>API: GET /api/paths/{path_id}
    API-->>W: ordered steps → path drawer
    U->>W: "Run attack demo"
    W->>API: POST /api/live/demo-attack
    API-->>W: NetworkThreat[] (synthetic intruder, MITRE)
    Note over W: injected node pulses red with severity badge;<br/>gateway still shown, real devices intact
    U->>W: "Clear demo attack"
    W->>API: DELETE /api/live/demo-attack
```

The demo intruder is clearly labeled (`DEMO-ATTACK`, MAC `de:ad:be:ef:*`) so it's never confused with a
real device.

---

## 5. Live Watch: devices on the wire + threats

```mermaid
sequenceDiagram
    participant AG as Agent (devices mode, --consent-subnet)
    participant API as /api/live/*
    participant URL as URL Trust Analyzer
    participant DET as live_threats.detect_threats
    participant W as Live Watch

    loop every sweep
      AG->>API: POST /api/live/devices {IP,MAC,hostname,vendor,subnet,active_subnets}
      API->>API: dedupe (org,mac); mark WiFi-active devices online,<br/>stale (>90s / other subnet) offline
      AG->>API: POST /api/live/observe {domain}
      API->>URL: score domain → band + verdict
      URL-->>API: Trusted/Caution/High Risk
    end
    W->>API: GET /api/live/devices · /api/live/network-threats
    API->>DET: detect over live devices + domains + deep-scan CVEs
    DET-->>API: arp_spoof / rogue_device / risky_service / malicious_domain (+MITRE)
    API-->>W: force-map of live devices; threats highlighted
```

**WiFi-aware:** each sweep reports `active_subnets`; devices not on an active subnet (or unseen > 90 s)
drop off, so switching networks clears the old network and surfaces the new one.

---

## 6. Deep Scan (consent-gated)

```mermaid
flowchart TB
    start(["User picks a device / subnet in Live Watch"]) --> consent{"consent = true?"}
    consent -->|no| r422a["422 — explicit consent required"]
    consent -->|yes| scope{"private RFC1918 target?<br/>(not loopback/link-local)"}
    scope -->|no| r422b["422 — LAN-only, public refused"]
    scope -->|yes| nmap["nmap -sV (real subprocess)"]
    nmap --> avail{"scan available?"}
    avail -->|no| unavail["persist available:false + reason<br/>(never fabricated)"]
    avail -->|yes| cve["CVE lookup (NVD/Vulners)"]
    cve --> integ["integration.apply_scan →<br/>create/update Asset + services + findings"]
    integ --> rc["one recompute → cross-host paths form"]
    rc --> persist["persist DeepScan result_json"]
    persist --> ui["UI shows ports, services, CVEs, new risk"]
```

Autoscan runs this on a schedule: always this host; the rest of the subnet only if `scan_subnet` is
explicitly authorized.

---

## 7. Network-config audit (NAT / DMZ / DHCP)

```mermaid
flowchart LR
    trigger["POST /api/netconfig/analyze"] --> facts["gather NetworkFacts<br/>(observed topology + live gateway + declared config)"]
    facts --> dmz["detect_dmz"]
    facts --> nat["detect_nat"]
    facts --> dhcp["detect_dhcp"]
    dmz & nat & dhcp --> classify{"evidence present?"}
    classify -->|yes, problem| real["status: real (+severity)<br/>→ engine Vulnerability + AssetVulnerability"]
    classify -->|yes, fine| passed["status: passed<br/>(contributes nothing)"]
    classify -->|no evidence| unknown["status: unknown<br/>(never a fabricated pass)"]
    real & passed & unknown --> store["persist NetconfigAnalysis + show in Report"]
```

On a live network this yields **real** findings (DHCP inferred from the live gateway, flat-network/no-DMZ
from the live sweep, NAT boundary), not "unknown".

`GET /api/netconfig/last` returns the most recent analysis for the org.

---

## 8. URL Trust Analyzer (+ Web Guard extension)

```mermaid
sequenceDiagram
    participant C as Browser / Extension
    participant API as /api/url-analyzer/analyze
    participant CH as checks (HTTPS, TLS, DNS, punycode, @, IP-host, creds, brand)
    participant PR as providers (Safe Browsing, VirusTotal — optional)
    participant SC as scoring

    C->>API: POST {url}
    API->>CH: run structural signals
    API->>PR: query if configured (else configured:false, contributes nothing)
    CH-->>SC: pass/warn/fail signals
    PR-->>SC: threat-feed verdicts
    Note over SC: weighted base over evaluated signals (renormalized)<br/>then hard caps (one red flag ceilings the score)
    SC-->>API: score 0-100 + band (Trusted/Caution/High Risk)
    API-->>C: verdict + per-signal breakdown
```

The extension blocks/ warns on High-Risk navigation; Live Watch reuses the same scoring for observed
domains.

---

## 9. Breach Simulation (client-side, no exploit)

```mermaid
flowchart LR
    p["Computed attack path<br/>(steps from /api/paths/:id)"] --> sim["BreachSimulation.tsx<br/>replays step-by-step"]
    sim --> anim["Animate INTERNET → hop → hop → crown jewel<br/>(purely presentational)"]
    anim --> note["Teaching aid — visualizes the already-computed path;<br/>runs nothing on any host"]
```

---

## 10. Data-fetching & cache invalidation (frontend)

```mermaid
flowchart TB
    q["TanStack Query<br/>retry 1 · no refetch-on-focus · 5s stale"] --> views["Dashboard / Map / Paths / Findings"]
    mut["Mutation<br/>(resolve finding, Recompute, deep scan)"] --> inv["qc.invalidateQueries()"]
    inv --> refetch["dependent queries refetch"]
    refetch --> views
```

Pressing **Recompute** in the Shell calls `POST /api/recompute` then invalidates all queries, so every
open view reflects the new model.
