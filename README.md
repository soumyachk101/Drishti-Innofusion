# ⚡ Drishti

**AI-powered defensive cybersecurity platform — maps, prices, and remediates attack paths. Never attacks.**

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)](https://fastapi.tiangolo.com/) [![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)](https://tailwindcss.com/) [![NetworkX](https://img.shields.io/badge/NetworkX-3.4-orange?logo=networkx)](https://networkx.org/) [![ReactFlow](https://img.shields.io/badge/ReactFlow-11.11-blue?logo=react)](https://reactflow.dev/) [![Redis](https://img.shields.io/badge/Redis-cache-red?logo=redis)](https://redis.io/)

---

## 🔍 What is Drishti?

Drishti is a **defensive-only** attack-path intelligence platform. It models a network the way an attacker reads it, traces the real routes from the internet to crown-jewel assets, prices each path in **dollars**, and drafts human-reviewed **Ansible fix** playbooks — but it **never attacks**.

> **It resolves a finding → total org exposure recomputes live.** On the seeded demo, that's a real drop from `$902,900 → $702,900`, asserted by the test suite.

---

## ✨ Key Capabilities

| Capability | Description |
|---|---|
| **Risk Engine** | Directed graph (NetworkX) with Yen's k-shortest paths; computes INTERNET → asset attack routes |
| **Dollar Impact Pricing** | Every path and every node is priced in $ (CVSS-weighted, blast-radius-aware) |
| **Remediation Studio** | 3-column studio that drafts Ansible playbooks — human-reviewed, never auto-deployed |
| **Live Watch** | Real-time LAN device discovery, DNS telemetry, mDNS app detection, threat feed integration |
| **Deep Scan** | Autonomous nmap-based deep scan with scheduled triggers |
| **URL Trust Analyzer** | Heuristic + ML scoring of URL reputation; blocks or warns before navigation |
| **AI Assistant** | Multi-provider LLM (Groq Llama 3.3, Anthropic Claude, NVIDIA) with mock mode |
| **Chrome Extension** | "Drishti Web Guard" — MV3 browser extension for real-time URL blocking |
| **Telegram Alerts** | Real-time push notifications for high/critical findings |
| **Network Config** | Auto-generated network config export from scan results |
| **Findings Dashboard** | Severity-ranked vulnerability findings with CVE enrichment (NVD) |
| **21-table Data Model** | Multi-tenant SQLAlchemy 2 models with Alembic migrations |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
 subgraph External["External Systems"]
 NVD["NVD API<br/>(CVE Enrichment)"]
 FEED["Threat Feeds<br/>(NVD/CISA)"]
 LLM["LLM Providers<br/>(Groq / Claude / NVIDIA)"]
 TELEGRAM["Telegram Bot API"]
 GB["Google Safe Browsing"]
 VT["VirusTotal"]
 end

 subgraph Edge["Edge Layer"]
 AGENT["Edge Agent<br/>(drishti_watch.py)<br/>LAN Discovery + Watch"]
 EXT["Chrome Extension<br/>(Web Guard MV3)"]
 end

 subgraph Server["Drishti Server :8000"]
 API["FastAPI Router Layer<br/>(16 routers)"]
 CORE["Core Services<br/>Auth · CORS · Rate Limit"]
 RISK["Risk Engine<br/>(NetworkX Graph)"]
 PATHS["Attack Path Finder<br/>(Yen's k-shortest)"]
 IMPACT["Impact Calculator<br/>($ Pricing)"]
 RECOMP["Recompute Engine<br/>(Live delta)"]
 DEEP["Deep Scan Scheduler<br/>(Autonomous nmap)"]
 URLT["URL Trust Analyzer<br/>(Heuristic + ML)"]
 AI_SVC["AI Service<br/>(Multi-provider)"]
 LIVE_SVC["Live Watch Service"]
 TELE_SVC["Telegram Alerts"]
 AUTO_SVC["Auto-Scan Scheduler"]
 HARD["Hardening Engine<br/>(Ansible Playbooks)"]
 DB[(SQLite / Postgres<br/>Alembic Migrations)]
 CACHE[(Redis Cache<br/>Verdict + Session)]
 end

 subgraph Frontend["Drishti Web :5173"]
 WEB["React SPA<br/>(Tailwind + ReactFlow)"]
 LANDING["Landing Page"]
 AUTH["Auth Shell<br/>(Login / Signup)"]
 DASH["Dashboard<br/>(Exposure Overview)"]
 GRAPH["Attack Map<br/>(ReactFlow Graph)"]
 PATHS_UI["Paths Explorer<br/>(Breach Simulation)"]
 FIND["Findings<br/>(Severity Table)"]
 REMED["Remediation Console<br/>(3-Column Studio)"]
 LIVE_UI["Live Watch<br/>(Real-time Devices)"]
 URL_UI["URL Analyzer"]
 REP_UI["Reports + NetConfig"]
 end

 %% External connections
 AGENT -->|"POST /api/ingest"| API
 EXT -->|"POST /api/url-analyzer/analyze"| API

 %% Server internal
 API --> CORE
 API --> RISK
 API --> PATHS
 API --> IMPACT
 API --> RECOMP
 API --> DEEP
 API --> URLT
 API --> AI_SVC
 API --> LIVE_SVC
 API --> TELE_SVC
 API --> AUTO_SVC
 API --> HARD

 CORE --> DB
 RISK --> DB
 PATHS --> RISK
 IMPACT --> PATHS
 RECOMP --> RISK
 LIVE_SVC --> CACHE
 URLT --> CACHE
 DEEP --> RISK
 AUTO_SVC --> DEEP

 %% External integrations
 AI_SVC --> LLM
 URLT --> GB
 URLT --> VT
 LIVE_SVC --> FEED
 TELE_SVC --> TELEGRAM
 DEEP --> DB

 %% Frontend
 WEB -->|"TanStack Query / Axios"| API
 LANDING -.-> WEB
 AUTH -.-> WEB
 DASH -.-> WEB
 GRAPH -.-> WEB
 PATHS_UI -.-> WEB
 FIND -.-> WEB
 REMED -.-> WEB
 LIVE_UI -.-> WEB
 URL_UI -.-> WEB
 REP_UI -.-> WEB
```

---

## 🧩 Component Architecture

```mermaid
flowchart LR
 subgraph Frontend["Frontend (React + Vite)"]
 direction TB
 FEAT["src/features/*<br/>(12 feature modules)"]
 STORE["Zustand Stores"]
 API_CLIENT["TanStack Query<br/>API Clients"]
 UI["UI Components<br/>(Tailwind + shadcn)"]
 GRAPH_LIB["ReactFlow<br/>(Attack Map)"]
 CHARTS["Recharts<br/>(Dashboards)"]
 MOTION["Framer Motion<br/>(Animations)"]
 end

 subgraph Server["Backend (FastAPI + SQLAlchemy)"]
 direction TB
 ROUTERS["16 API Routers<br/>(v1/)"]
 MODELS["10 Models<br/>(Org, Asset, Vuln, Finding,<br/>Path, Scan, Remediation,<br/>Live, NetConfig, UrlTrust)"]
 SCHEMAS["Pydantic Schemas"]
 SERVICES["9 Service Modules<br/>(risk_engine, attack_paths,<br/>impact, recompute, ingest,<br/>deepscan, urltrust,<br/>live, hardening)"]
 CORE_SVC["Core<br/>(security, deps, errors)"]
 SEED["Seed Scripts<br/>(Acme demo org)"]
 CONFIG["Config<br/>(env-driven, pydantic-settings)"]
 end

 subgraph Agent["Edge Agent"]
 WATCH["drishti_watch.py<br/>(DNS/history/conn/devices)"]
 INGEST["drishti_agent.py<br/>(Fixture replay + POST)"]
 end

 subgraph Ext["Chrome Extension"]
 BG["background.js<br/>(Service Worker)"]
 WARN["warning.html/js/css<br/>(Block Page)"]
 OPT["options.html/js<br/>(Settings + Auth)"]
 end

 FEAT --> API_CLIENT
 API_CLIENT -->|"HTTP /api/*"| ROUTERS
 ROUTERS --> SCHEMAS
 ROUTERS --> SERVICES
 SERVICES --> MODELS
 MODELS -->|"SQLAlchemy 2"| DB[(Database)]

 INGEST -->|"Bearer Token"| ROUTERS
 WATCH -->|"WebSocket / SSE"| LIVE_SVC

 BG -->|"chrome.webNavigation"| BG
 BG -->|"POST /api/url-analyzer"| ROUTERS
 BG --> WARN
 BG --> OPT
```

---

## 🔄 Data Flow — End-to-End

```mermaid
flowchart LR
 subgraph Input["Data Input Sources"]
 INGEST_PAYLOAD["Agent Ingest<br/>(Assets + Vulns)"]
 USER_SCAN["User-Triggered Scan<br/>(Auto/Deep Scan)"]
 LIVE_DISC["Live Watch<br/>(DNS/mDNS Discovery)"]
 URL_CHECK["URL Check<br/>(Extension + Web UI)"]
 AI_CHAT["AI Chat<br/>(User Query)"]
 end

 subgraph Process["Processing Pipeline"]
 VALIDATE["Validate + Auth<br/>(JWT + Bearer)"]
 INGEST_SVC["Ingest Service<br/>(Asset + Vuln CRUD)"]
 RISK_COMP["Risk Engine<br/>(NetworkX Graph Build)"]
 PATH_FIND["Attack Paths<br/>(Yen's k-shortest)"]
 IMPACT_CALC["Impact Pricing<br/>($ CVSS × Blast Radius)"]
 RECOMPUTE["Recompute<br/>(Live Delta)"]
 URL_ANALYZE["URL Analyzer<br/>(Heuristic + ML Score)"]
 AI_PROC["AI Service<br/>(Multi-provider LLM)"]
 TELE_NOTIFY["Telegram Notify<br/>(High/Critical Alerts)"]
 end

 subgraph Output["Output & Storage"]
 DB_STORE[(Database<br/>Postgres/SQLite)]
 CACHE_STORE[(Cache<br/>Verdicts/Sessions)]
 API_RESP["JSON Response"]
 WEB_UI["Web UI Update<br/>(React + TanStack Query)"]
 EXT_BLOCK["Extension Block/Warn"]
 TG_MSG["Telegram Message"]
 ANSIBLE["Ansible Playbook<br/>(Remediation)"]
 end

 INGEST_PAYLOAD --> VALIDATE --> INGEST_SVC --> DB_STORE
 INGEST_SVC --> RISK_COMP --> PATH_FIND --> IMPACT_CALC --> DB_STORE
 USER_SCAN --> VALIDATE --> INGEST_SVC
 LIVE_DISC --> VALIDATE --> DB_STORE
 URL_CHECK --> VALIDATE --> URL_ANALYZE --> CACHE_STORE --> API_RESP --> EXT_BLOCK
 AI_CHAT --> VALIDATE --> AI_PROC --> API_RESP --> WEB_UI
 DB_STORE --> RECOMPUTE --> DB_STORE
 RISK_COMP --> TELE_NOTIFY --> TG_MSG
 PATH_FIND --> ANSIBLE
```

---

## ⚔️ Risk Engine — Attack Path Graph Model

```mermaid
flowchart TD
 subgraph GraphModel["Directed Attack Graph (NetworkX)"]
 direction LR

 INTERNET(["🌐 INTERNET<br/>(Source Node)"])

 FIREWALL1(["🛡️ Firewall<br/>(WAN Edge)"])
 FW1_PRICE["$ 0"]

 DMZ_SRV(["🖥️ DMZ Server<br/>(Apache 2.4.49)"])
 DMZ_VULN["CVE-2021-41773<br/>CVSS 7.5"]
 DMZ_PRICE["$ 45,000"]

 LB(["⚖️ Load Balancer<br/>(nginx)"])
 LB_PRICE["$ 12,000"]

 APP_SRV(["📱 App Server<br/>(Node.js API)"])
 APP_VULN["CVE-2023-XXXX<br/>CVSS 9.8"]
 APP_PRICE["$ 180,000"]

 DB(["🗄️ Database<br/>(PostgreSQL)"])
 DB_PRICE["$ 500,000<br/>👑 Crown Jewel"]

 MON(["📊 Monitoring<br/>(Prometheus)"])
 MON_PRICE["$ 8,000"]
 end

 subgraph AttackPaths["Computed Attack Paths"]
 direction TB
 P1["Path 1: INTERNET → FW → DMZ<br/>Cost: $45,000<br/>Steps: 1 exploit"]
 P2["Path 2: INTERNET → FW → DMZ → LB → APP<br/>Cost: $180,000<br/>Steps: 2 exploits"]
 P3["Path 3: INTERNET → FW → DMZ → APP → DB<br/>Cost: $500,000<br/>Steps: 3 exploits ⚠️ CRITICAL"]
 P4["Path 4: INTERNET → FW → MON<br/>Cost: $8,000<br/>Steps: 1 exploit"]
 end

 INTERNET -->|"HTTPS 443"| FIREWALL1
 FIREWALL1 -->|"Port 80/443"| DMZ_SRV
 FIREWALL1 -->|"HTTPS 443"| LB
 LB -->|"HTTP 3000"| APP_SRV
 APP_SRV -->|"TCP 5432"| DB
 FIREWALL1 -->|"SNMP 161"| MON

 DMZ_SRV --> P1
 APP_SRV --> P2
 DB --> P3
 MON --> P4
```

---

## 🌐 Network Topology — Live Watch

```mermaid
graph TB
 subgraph Internet["Internet"]
 ATTACKER(["Attacker Surface<br/>INTERNET"])
 end

 subgraph Perimeter["Perimeter Network"]
 RTR(["Router<br/>192.168.1.1<br/>OpenWrt"])
 FW(["Firewall<br/>192.168.1.2<br/>pfSense"])
 end

 subgraph LAN["LAN Subnet — 192.168.1.0/24"]
 SRV1(["App Server<br/>192.168.1.10<br/>🟢 Online"])
 SRV2(["DB Server<br/>192.168.1.20<br/>🟢 Online"])
 SRV3(["NAS / File<br/>192.168.1.30<br/>🟡 Degraded"])
 WS1(["Workstation<br/>192.168.1.100<br/>🟢 Online"])
 WS2(["Dev Machine<br/>192.168.1.101<br/>🔴 Offline"])
 PRT1(["Printer<br/>192.168.1.50<br/>🟡 Degraded"])
 MOB1(["iPhone<br/>192.168.1.200<br/>🟢 Online"])
 end

 subgraph IoT["IoT Subnet — 192.168.2.0/24"]
 CAM1(["Camera 01<br/>192.168.2.10<br/>🟡 Degraded"])
 CAM2(["Camera 02<br/>192.168.2.11<br/>🟢 Online"])
 TSTAT(["Thermostat<br/>192.168.2.20<br/>🔴 Offline"])
 end

 ATTACKER -->|"Scanning"| RTR
 RTR <--> FW
 FW <--> SRV1
 FW <--> SRV2
 FW <--> SRV3
 FW <--> WS1
 FW <--> WS2
 FW <--> PRT1
 FW <--> MOB1
 FW <--> CAM1
 FW <--> CAM2
 FW <--> TSTAT

 subgraph AgentDiscovery["Discovered by Agent"]
 direction LR
 DNS(["DNS Queries<br/>monitored"])
 MDNS(["mDNS Discovery<br/>_http._tcp.local"])
 ARP(["ARP Table<br/>parsed"])
 end

 DNS -.-> WS1
 MDNS -.-> CAM1
 ARP -.-> SRV1
```

---

## 🔐 Authentication & Security Flow

```mermaid
sequenceDiagram
 actor User
 actor Extension
 participant Frontend as Drishti Web
 participant Backend as FastAPI Server
 participant DB as Database
 participant Cache as Redis Cache
 participant LLM as LLM Provider

 %% Auth Flow
 User->>Frontend: Enter credentials
 Frontend->>Backend: POST /api/auth/login<br/>{email, password}
 Backend->>DB: Verify user (bcrypt)
 DB-->>Backend: User record
 Backend->>Backend: Create JWT (access 15m, refresh 7d)
 Backend-->>Frontend: {access_token, refresh_token}
 Frontend->>Frontend: Store tokens (memory + localStorage)

 %% API Call with JWT
 Frontend->>Backend: GET /api/findings<br/>Authorization: Bearer {token}
 Backend->>Backend: Validate JWT (python-jose)
 Backend->>DB: Query findings (org-scoped)
 DB-->>Backend: Findings list
 Backend-->>Frontend: {findings: [...]}

 %% Refresh Flow
 Frontend->>Backend: POST /api/auth/refresh
 Backend->>Backend: Validate refresh token
 Backend-->>Frontend: {access_token: new}

 %% AI Flow
 Frontend->>Backend: POST /api/ai/chat<br/>Bearer {token}
 Backend->>Backend: Auth check + rate limit
 Backend->>LLM: Stream completion<br/>(Groq/Claude/NVIDIA)
 LLM-->>Backend: Streamed response
 Backend-->>Frontend: {response: "..."}

 %% Extension Auth
 Extension->>Backend: POST /api/auth/login<br/>(from options page)
 Backend-->>Extension: {access_token}
 Extension->>Extension: chrome.storage.local.set

 %% URL Check (Extension)
 Extension->>Backend: POST /api/url-analyzer/analyze<br/>Authorization: Bearer {token}
 Backend->>Cache: Check verdict cache
 alt Cache Hit
 Cache-->>Backend: {band, score, reasons}
 else Cache Miss
 Backend->>Backend: Heuristic + ML scoring
 Backend->>Cache: Store result (TTL 10m)
 end
 Backend-->>Extension: {band: "High Risk"|"Caution"|"Trusted"}
 alt High Risk
 Extension->>Extension: Redirect to warning page
 else Caution
 Extension->>Extension: Amber toolbar badge
 else Trusted
 Extension->>Extension: Teal toolbar badge (continue)
 end
```

---

## 📦 Repository Structure

```mermaid
graph TD
 ROOT["drishti/"]
 SERVER["server/"]
 WEB["web/"]
 AGENT["agent/"]
 EXT["extension/"]
 DOCS["Drishti Docs/"]

 ROOT --> SERVER
 ROOT --> WEB
 ROOT --> AGENT
 ROOT --> EXT
 ROOT --> DOCS

 subgraph ServerStructure["server/app/"]
 S_MAIN["main.py<br/>(App Assembly)"]
 S_CONFIG["config.py<br/>(Env Settings)"]
 S_DB["db.py<br/>(SQLAlchemy Engine)"]
 S_INIT["db_init.py<br/>(Schema Migrations)"]

 S_API["api/v1/<br/>(16 Routers)"]
 S_MODELS["models/<br/>(10 ORM Models)"]
 S_SCHEMAS["schemas/<br/>(Pydantic DTOs)"]
 S_SERVICES["services/<br/>(9 Service Modules)"]
 S_CORE["core/<br/>(Security + Deps)"]
 S_SEED["seed/<br/>(Demo Data)"]
 S_SCRIPTS["scripts/<br/>(Maintenance)"]
 end

 subgraph WebStructure["web/src/"]
 W_APP["App.tsx<br/>(Router + Providers)"]
 W_AUTH["auth/<br/>(Auth Context)"]
 W_FEATURES["features/<br/>(12 Feature Modules)"]
 W_API["api/<br/>(HTTP Clients)"]
 W_STORE["store/<br/>(Zustand)"]
 W_COMPONENTS["components/<br/>(Shared UI)"]
 W_STYLES["styles/<br/>(Tailwind + CSS)"]
 end

 subgraph AgentFiles["agent/"]
 A_WATCH["drishti_watch.py<br/>(Live Watch Daemon)"]
 A_INGEST["drishti_agent.py<br/>(Snapshot Ingester)"]
 end

 subgraph ExtFiles["extension/"]
 E_MANIFEST["manifest.json<br/>(MV3 Config)"]
 E_BG["background.js<br/>(Service Worker)"]
 E_WARN["warning.html/js/css<br/>(Block Page)"]
 E_OPT["options.html/js<br/>(Settings UI)"]
 end

 SERVER --> S_MAIN
 S_MAIN --> S_API
 S_API --> S_SERVICES
 S_SERVICES --> S_MODELS

 WEB --> W_APP
 W_APP --> W_FEATURES

 AGENT --> A_WATCH
 AGENT --> A_INGEST
 EXT --> E_MANIFEST
```

---

## 🔁 Recompute & Exposure Tracking

```mermaid
flowchart TD
 subgraph Trigger["Trigger Events"]
 T1["New Finding Created"]
 T2["Finding Resolved"]
 T3["New Asset Discovered"]
 T4["Vulnerability Patched"]
 T5["Asset Removed"]
 end

 subgraph RecomputeEngine["Recompute Engine"]
 direction TB
 STEP1["1. Load Org Assets<br/>(All nodes in org)"]
 STEP2["2. Rebuild Graph<br/>(NetworkX DiGraph)"]
 STEP3["3. Run k-Shortest Paths<br/>(Yen's algorithm)"]
 STEP4["4. Price Each Path<br/>(CVSS × blast radius)"]
 STEP5["5. Find Min-Cut Paths<br/>(Critical routes)"]
 STEP6["6. Aggregate Exposure<br/>(Total $ at risk)"]
 STEP7["7. Store Results<br/>(Updated exposure metric)"]
 end

 subgraph Result["Results"]
 R1["Total Exposure: $702,900"]
 R2["Top Risk Path: 3 hops"]
 R3["Crown Jewels: 2 flagged"]
 R4["Trend: ↓ 22% (was $902,900)"]
 R5["Findings Count: 23 open"]
 end

 T1 --> STEP1
 T2 --> STEP1
 T3 --> STEP1
 T4 --> STEP1
 T5 --> STEP1

 STEP1 --> STEP2 --> STEP3 --> STEP4 --> STEP5 --> STEP6 --> STEP7
 STEP7 --> R1 --> R2 --> R3 --> R4 --> R5
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with `uv` (recommended) or pip
- **Node.js 18+** with pnpm or npm
- **Redis** (optional, for verdict caching — falls back to memory)

### Backend

```bash
# Create virtual environment and install dependencies
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env # adjust as needed

# Run the server (auto-seeds demo org on first boot)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server is now running at **http://localhost:8000** with auto-seeded demo data.

### Web Frontend

```bash
cd web
npm install
npm run dev
```

The web UI is now at **http://localhost:5173**.

### Edge Agent (Live Watch)

```bash
# Device discovery mode
python agent/drishti_watch.py --mode devices --discover-wifi --server http://localhost:8000 --token agent-demo-token

# Or ingest a scan fixture (demo)
python agent/drishti_agent.py --once \
 --fixture server/app/seed/fixtures/db-prod-01.json \
 --server http://localhost:8000 \
 --token agent-demo-token
```

### Chrome Extension (Web Guard)

1. Open `chrome://extensions` → toggle **Developer mode**
2. Click **Load unpacked** → select the `extension/` folder
3. Open extension options → configure server URL and log in

Demo credentials: `analyst@acme-retail.dev` / `drishti-demo`

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.0 + Alembic |
| Auth | python-jose (JWT) + bcrypt |
| Graph Engine | NetworkX 3.4 |
| ML/Stats | scikit-learn, numpy, scipy |
| Scheduling | APScheduler (deep scan) |
| Monitoring | prometheus-client, psutil |
| Parsing | beautifulsoup4, lxml, bleach |
| Feeds | feedparser, dnspython |
| CVE Data | nvdlib |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| Data Fetching | TanStack Query 5.51 |
| Graph | ReactFlow 11.11 |
| Charts | Recharts 2.12 |
| Animation | Framer Motion 12.42 |
| Icons | Lucide React 0.427 |
| Testing | Vitest + Testing Library |

### Edge

| Component | Details |
|---|---|
| Agent | Python stdlib-only (no external deps) |
| Extension | Chrome MV3 (manifest v3) |
| Backend | Auto-starts on server boot (dev) |

---

## 📁 Repository Map

```
drishti/
├── server/ # FastAPI backend
│ ├── app/
│ │ ├── main.py # App assembly, lifespan, middleware
│ │ ├── config.py # Environment-driven settings
│ │ ├── db.py # SQLAlchemy engine + session
│ │ ├── db_init.py # Schema column reconciliation
│ │ ├── api/v1/ # 16 REST routers
│ │ │ ├── auth.py # JWT login/refresh
│ │ │ ├── ingest.py # Agent data ingestion
│ │ │ ├── graph.py # Graph data API
│ │ │ ├── paths.py # Attack path computation
│ │ │ ├── findings.py # Vulnerability findings
│ │ │ ├── ai.py # LLM chat/analysis
│ │ │ ├── live.py # Real-time telemetry
│ │ │ ├── netconfig.py # Network config export
│ │ │ ├── urltrust.py # URL reputation
│ │ │ ├── scan.py # Deep scan triggers
│ │ │ └── ...
│ │ ├── models/ # 10 SQLAlchemy ORM models
│ │ │ ├── org.py, asset.py, vuln.py
│ │ │ ├── finding.py, path.py, scan.py
│ │ │ ├── remediation.py, live.py
│ │ │ ├── netconfig.py, urltrust.py
│ │ ├── schemas/ # Pydantic request/response
│ │ ├── services/ # 9 business-logic modules
│ │ │ ├── risk_engine.py # NetworkX graph engine
│ │ │ ├── attack_paths.py # Yen's k-shortest
│ │ │ ├── impact.py # $ pricing model
│ │ │ ├── recompute.py # Live exposure delta
│ │ │ ├── ingest.py # Agent payload processing
│ │ │ ├── urltrust/ # URL scoring heuristics + ML
│ │ │ ├── deepscan/ # Autonomous nmap scanner
│ │ │ ├── netconfig/ # Network config generation
│ │ │ ├── live.py # Live watch orchestration
│ │ │ └── telegram_alerts.py
│ │ ├── core/ # Security, deps, error handlers
│ │ ├── seed/ # Acme demo network + fixtures
│ │ └── scripts/ # Maintenance utilities
│ ├── tests/ # pytest suite (232+ tests)
│ ├── requirements.txt
│ ├── pyproject.toml
│ └── run.py
├── web/ # React SPA
│ ├── src/
│ │ ├── App.tsx # Root router + providers
│ │ ├── features/ # 12 feature modules
│ │ │ ├── landing/ # Marketing page
│ │ │ ├── auth/ # Login / Signup
│ │ │ ├── dashboard/ # Exposure overview
│ │ │ ├── graph/ # Attack map (ReactFlow)
│ │ │ ├── paths/ # Breach simulation
│ │ │ ├── findings/ # Findings table
│ │ │ ├── remediation/ # 3-column studio
│ │ │ ├── live/ # Live watch (ForceMap)
│ │ │ ├── report/ # Reports + NetConfig
│ │ │ ├── settings/ # Org settings
│ │ │ └── urltrust/ # URL analyzer UI
│ │ ├── api/ # TypeScript API clients
│ │ ├── store/ # Zustand state
│ │ ├── components/ # Shared components
│ │ ├── lib/ # Utilities
│ │ └── styles/ # Tailwind + globals
│ ├── package.json
│ ├── vite.config.ts
│ └── Dockerfile
├── agent/ # Edge agent (stdlib-only Python)
│ ├── drishti_watch.py # Live watch daemon
│ └── drishti_agent.py # Snapshot ingester
├── extension/ # Chrome Web Guard (MV3)
│ ├── manifest.json
│ ├── background.js # Service worker
│ ├── options.html/js # Auth + settings
│ ├── warning.html/js/css # Block page
│ └── README.md
├── Drishti Docs/ # Full documentation suite
│ ├── PRD.md # Product Requirements
│ ├── TRD.md # Technical Requirements
│ ├── ARCHITECTURE.md # C4 diagrams + design decisions
│ ├── APP_FLOW.md # Sequence diagrams
│ ├── DATA_MODEL.md # ER diagram + table dictionary
│ ├── API_REFERENCE.md # Every endpoint documented
│ ├── SECURITY_MODEL.md # Defensive-only stance
│ └── UIUX.md # Design system spec
└── README.md ← you are here
```

---

## 🔬 Risk Engine — How It Works

```
 ┌──────────────────────────────────────────────────────┐
 │ INTERNET ──── Source Node (Entry Point) │
 └──────────────────────────────────────────────────────┘
 │
 ┌──────────────────▼──────────────────┐
 │ Build Directed Graph (NetworkX) │
 │ Nodes: Assets, Services, Vulns │
 │ Edges: Network paths, trust zones │
 └──────────────────┬──────────────────┘
 │
 ┌──────────────────▼──────────────────┐
 │ Yen's k-Shortest Paths Algorithm │
 │ Find all INTERNET → Crown Jewel │
 │ attack routes (weighted by CVSS) │
 └──────────────────┬──────────────────┘
 │
 ┌──────────────────▼──────────────────┐
 │ Dollar Impact Pricing │
 │ Path Cost = Σ(Exploit Cost + │
 │ Blast Radius × Asset) │
 │ Node Price = CVSS × Asset Value │
 └──────────────────┬──────────────────┘
 │
 ┌──────────────────▼──────────────────┐
 │ Blast Radius Analysis │
 │ If asset A is compromised, │
 │ which assets become reachable? │
 │ → Cascade impact calculation │
 └──────────────────┬──────────────────┘
 │
 ┌──────────────────▼──────────────────┐
 │ Ansible Remediation │
 │ Draft human-reviewed playbooks: │
 │ • Patch deployment │
 │ • Firewall rules │
 │ • Service hardening │
 │ NEVER auto-executed │
 └──────────────────────────────────────┘
```

### Scoring Model

| Factor | Weight | Description |
|---|---|---|
| CVSS Base Score | 40% | Vulnerability severity (0–10) |
| Asset Criticality | 30% | Crown jewel multiplier (1×–5×) |
| Exposure Score | 20% | Publicly reachable vs. segmented |
| Blast Radius | 10% | Downstream assets compromised if breached |

---

## 🔒 Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│ DEFENSIVE-ONLY — Non-Negotiable Principles │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ✅ Maps and prices attack paths │
│ ✅ Traces INTERNET → asset routes │
│ ✅ Drafts Ansible remediation playbooks │
│ ✅ Blocks navigation to high-risk URLs │
│ ✅ Sends real-time threat alerts │
│ ✅ Discovers devices on consented subnets │
│ │
│ ❌ Never launches exploits │
│ ❌ Never intercepts traffic │
│ ❌ Never auto-deploys fixes │
│ ❌ Never scans third-party systems without consent │
│ ❌ Never transmits raw packets │
│ │
│ 🔐 Auth: JWT (access 15m, refresh 7d) + Bearer tokens │
│ 🔐 Ext: chrome.storage (local + session) │
│ 🔐 Agent: Per-agent bearer tokens │
│ 🔐 Fail-open: Network/API failures → permit, never block │
│ 🔐 Input: bleach-sanitized, SQL injection safe (ORM) │
│ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Reference

### Core Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | JWT login (email + password) |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Current user profile |
| `POST` | `/api/ingest` | Agent data ingestion (assets + vulns) |
| `GET` | `/api/assets` | List organization assets |
| `GET` | `/api/assets/{id}` | Asset detail with vulns |
| `GET` | `/api/findings` | Vulnerability findings |
| `GET` | `/api/findings/{id}/resolve` | Resolve finding → triggers recompute |
| `GET` | `/api/graph` | Network graph (nodes + edges) |
| `GET` | `/api/paths` | Computed attack paths |
| `GET` | `/api/paths/{id}` | Single path detail with dollar pricing |
| `GET` | `/api/ai/chat` | LLM chat (multi-provider) |
| `GET` | `/api/dashboard` | Exposure metrics + trends |
| `GET` | `/api/report` | Full network report |
| `GET` | `/api/netconfig` | Network config export |
| `GET` | `/api/live/devices` | Live-discovered devices |
| `GET` | `/api/live/threats` | Live threat feed |
| `POST` | `/api/scan/trigger` | Trigger deep scan |
| `GET` | `/api/scan/{id}` | Scan result |
| `POST` | `/api/url-analyzer/analyze` | URL reputation scoring |
| `GET/POST` | `/api/url-trust` | URL trust allow/deny list |

---

## 🧪 Testing

```bash
# Backend — pytest (232+ tests)
cd server
source .venv/bin/activate
pytest --tb=short -v

# Frontend — Vitest
cd web
npm test
```

---

## 📊 Demo Data

On first boot (with `DEMO_SEED=1`), the server auto-seeds the **Acme Retail** demo network:

| Asset | Type | CVSS | Dollar Value |
|---|---|---|---|
| web.acme-retail.dev | DMZ Web Server | 7.5 | $45,000 |
| api.acme-retail.dev | Application Server | 9.8 | $180,000 |
| db.acme-retail.dev | Database (Crown Jewel) | 9.1 | $500,000 |
| mail.acme-retail.dev | Mail Server | 6.1 | $15,000 |
| vpn.acme-retail.dev | VPN Gateway | 7.8 | $90,000 |
| **Total Exposure** | | | **$902,900** |

Login with `analyst@acme-retail.dev` / `drishti-demo` to explore.

---

## 📄 Documentation

Full documentation suite available in [`Drishti Docs/`](Drishti%20Docs/):

| Document | Content |
|---|---|
| [PRD.md](Drishti%20Docs/PRD.md) | Product requirements, personas, goals |
| [TRD.md](Drishti%20Docs/TRD.md) | Technical requirements, stack, formulas |
| [ARCHITECTURE.md](Drishti%20Docs/ARCHITECTURE.md) | C4 diagrams, design decisions, repo map |
| [APP_FLOW.md](Drishti%20Docs/APP_FLOW.md) | Sequence diagrams for all user journeys |
| [DATA_MODEL.md](Drishti%20Docs/DATA_MODEL.md) | ER diagram, 21-table dictionary |
| [API_REFERENCE.md](Drishti%20Docs/API_REFERENCE.md) | Every endpoint (method, auth, schema) |
| [SECURITY_MODEL.md](Drishti%20Docs/SECURITY_MODEL.md) | Defensive-only stance, consent gating |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

All code must pass the existing test suites (232+ backend tests, frontend Vitest).

---

## 📜 License

MIT License — see [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Drishti** — See the invisible. Price the risk. Fix it first.

*Defensive only. Maps, prices, and remediates. Never attacks.*

</div>
