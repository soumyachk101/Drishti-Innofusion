<!-- Hero Section -->
<div align="center">

# <span style="font-size:48px;">👁️</span> Drishti

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-v0.1.0-blue?style=flat-square)
![Stance](https://img.shields.io/badge/Stance-Defensive_Only-red?style=flat-square)

*AI-powered attack-path intelligence platform.* Maps how an attacker reads your network, traces every route from the internet to crown-jewel assets, prices each path in **dollars**, and drafts human-reviewed Ansible fixes. Never attacks.

---

### Tech Stack

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/) &nbsp;
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) &nbsp;
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-003B57?style=flat-square&logo=data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M12 2L2 7v10l10 5 10-5V7L12 2z'/></svg>)](https://www.sqlalchemy.org/) &nbsp;
[![NetworkX](https://img.shields.io/badge/NetworkX-3.4-E74C3C?style=flat-square&logo=python&logoColor=white)](https://networkx.org/) &nbsp;
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/) &nbsp;
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) &nbsp;
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) &nbsp;
[![ReactFlow](https://img.shields.io/badge/ReactFlow-11.11-BFBFBF?style=flat-square&logo=react&logoColor=white)](https://reactflow.dev/) &nbsp;
[![Zustand](https://img.shields.io/badge/Zustand-4.5-443E38?style=flat-square&logo=data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M12 2L2 7v10l10 5 10-5V7L12 2z'/></svg>)](https://docs.pmnd.rs/zustand) &nbsp;
[![TanStack](https://img.shields.io/badge/TanStack_Query-5.51-FF4154?style=flat-square&logo=data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10'/></svg>)](https://tanstack.com/query) &nbsp;
[![Vitest](https://img.shields.io/badge/Vitest-2.0-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/) &nbsp;
[![pytest](https://img.shields.io/badge/pytest-232%2B_tests-0A9EDC?style=flat-square&logo=data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10'/></svg>)](https://pytest.org/)

</div>

---

## ✨ Core Capabilities

<div align="center">

| | | | |
|---|---|---|---|
| 🕸️ **Risk Engine** | 💰 **Dollar Pricing** | 🛠️ **Remediation Studio** | 📡 **Live Watch** |
| NetworkX directed graph with Yen's k-shortest paths. Computes every INTERNET → asset attack route. | Every path and node priced in $ using CVSS-weighted blast-radius model. | 3-column studio drafting Ansible playbooks — human reviewed, never auto-deployed. | Real-time LAN device discovery via DNS, mDNS, ARP with live telemetry streaming. |
| | | | |
| 🔍 **Deep Scan** | 🌐 **URL Trust** | 🤖 **AI Assistant** | 🔔 **Telegram Alerts** |
| Autonomous nmap deep-scan scheduler with trigger-based execution. | Heuristic + ML URL reputation scoring — blocks high-risk navigation. | Multi-provider LLM (Groq Llama 3.3 / Claude / NVIDIA) with mock mode. | Real-time push notifications for high/critical findings. |
| | | | |
| 🔌 **Chrome Extension** | 📊 **Findings Dashboard** | 📋 **Reports + NetConfig** | 🔄 **Live Recompute** |
| "Web Guard" MV3 browser extension for real-time URL warning/blocking. | Severity-ranked vulnerability table with CVE enrichment from NVD. | Auto-generated network config export and full org security reports. | Resolve a finding → total org exposure recomputes instantly. |

</div>

> 💡 **Live demo:** On the seeded Acme Retail network, resolving a critical finding drops total exposure from **$902,900 → $702,900** — verified by the test suite.

---

## 🏗️ System Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
flowchart TB
 classDef layer fill:#0f3460,stroke:#38c6f4,stroke-width:2px,color:#e0e0e0,rx:16
 classDef external fill:#1a1a2e,stroke:#e94560,stroke-width:1.5px,color:#ff6b6b,stroke-dasharray:5 5
 classDef agent fill:#0a3d62,stroke:#38c6f4,stroke-width:1.5px,color:#38c6f4
 classDef server fill:#16213e,stroke:#38c6f4,stroke-width:2.5px,color:#e0e0e0
 classDef frontend fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#e0e0e0
 classDef arrow stroke:#38c6f4,stroke-width:2px,color:#38c6f4

 subgraph EXT_SYS [🔌 External Systems]
 direction LR
 NVD["🏛️ NVD API<br/><i>CVE Enrichment</i>"]
 FEED["📡 Threat Feeds<br/><i>CISA / NVD</i>"]
 LLM["🧠 LLM Providers<br/><i>Groq · Claude · NVIDIA</i>"]
 TG["💬 Telegram Bot<br/><i>Push Alerts</i>"]
 GSB["🛡️ Google Safe<br/>Browsing"]
 VT["🔬 VirusTotal"]
 end

 subgraph EDGE [📡 Edge Layer]
 direction TB
 AGENT_WATCH["👁️ Live Watch<br/><code>drishti_watch.py</code><br/><i>DNS · mDNS · ARP · WiFi</i>"]
 AGENT_INGEST["📦 Edge Agent<br/><code>drishti_agent.py</code><br/><i>Snapshot + Ingest</i>"]
 WEB_EXT["🧩 Chrome Extension<br/><b>Web Guard MV3</b><br/><i>URL Block + Warn</i>"]
 end

 subgraph BACKEND [🖥️ Drishti Server :8000]
 direction TB
 ROUTERS["🔀 16 API Routers<br/><code>/api/{auth,ingest,graph,paths,<br/>findings,ai,live,netconfig,<br/>urltrust,report,scan,...}</code>"]
 RISK_ENG["🕸️ Risk Engine<br/><code>NetworkX DiGraph</code>"]
 PATH_FIND["🔍 Attack Path Finder<br/><code>Yen's k-Shortest</code>"]
 IMPACT["💰 Impact Calculator<br/><code>$ CVSS × Blast Radius</code>"]
 RECOMP["🔄 Recompute Engine<br/><code>Live Delta</code>"]
 URLT["🌐 URL Trust Analyzer<br/><code>Heuristic + ML</code>"]
 DEEP["🔬 Deep Scan<br/><code>Autonomous nmap</code>"]
 AUTO["⏰ Auto-Scan Scheduler<br/><code>APScheduler</code>"]
 AI_SVC["🤖 AI Service<br/><code>Multi-provider LLM</code>"]
 LIVE_SVC["📡 Live Watch Service"]
 TELE_SVC["🔔 Telegram Alerts"]
 HARD["🔧 Hardening Engine<br/><code>Ansible Playbooks</code>"]
 end

 subgraph DATA [💾 Data Layer]
 direction LR
 DB[(🗄️ PostgreSQL<br/><i>+ Alembic Migrations</i>)]
 CACHE[(⚡ Redis Cache<br/><i>Verdicts + Sessions</i>)]
 end

 subgraph FRONTEND [🌐 Drishti Web :5173]
 direction TB
 LANDING["🏠 Landing Page<br/><i>Marketing + Hero</i>"]
 AUTH_UI["🔐 Auth Shell<br/><i>Login · Signup · JWT</i>"]
 DASH["📊 Dashboard<br/><i>Exposure Overview</i>"]
 ATTACK_MAP["🕸️ Attack Map<br/><code>ReactFlow</code> Graph"]
 PATHS_UI["🔍 Paths Explorer<br/><i>Breach Simulation</i>"]
 FINDINGS["🚨 Findings<br/><i>Severity Table</i>"]
 REMEDIATION["🛠️ Remediation Studio<br/><i>3-Column Ansible UI</i>"]
 LIVE_UI["📡 Live Watch<br/><i>Force-Directed Map</i>"]
 URL_UI["🌐 URL Analyzer<br/><i>Trust Scoring UI</i>"]
 REPORTS["📋 Reports<br/><i>NetConfig Export</i>"]
 end

 class EXT_SYS,FRONTEND layer
 class EDGE agent
 class BACKEND server
 class DATA,DB,CACHE external
 class ROUTERS,RISK_ENG,PATH_FIND,IMPACT,RECOMP,URLT,DEEP,AUTO,AI_SVC,LIVE_SVC,TELE_SVC,HARD server
 class AGENT_WATCH,AGENT_INGEST,WEB_EXT agent

 AGENT_WATCH -.->|"📡 mDNS / DNS"| LIVE_SVC
 AGENT_INGEST -.->|"📦 POST /api/ingest"| ROUTERS
 WEB_EXT -.->|"🔒 POST /api/url-analyzer"| ROUTERS

 ROUTERS --> RISK_ENG
 ROUTERS --> PATH_FIND
 ROUTERS --> IMPACT
 ROUTERS --> RECOMP
 ROUTERS --> URLT
 ROUTERS --> AI_SVC
 ROUTERS --> LIVE_SVC
 ROUTERS --> TELE_SVC
 ROUTERS --> HARD
 ROUTERS --> DEEP
 DEEP --> AUTO
 AUTO --> DEEP

 RISK_ENG --> PATH_FIND
 PATH_FIND --> IMPACT
 RECOMP --> RISK_ENG
 URLT --> CACHE

 RISK_ENG --> DB
 PATH_FIND --> DB
 IMPACT --> DB
 AI_SVC --> LLM
 URLT --> GSB
 URLT --> VT
 LIVE_SVC --> FEED
 TELE_SVC --> TG
 DEEP --> DB

 LANDING --> AUTH_UI --> DASH --> ATTACK_MAP --> PATHS_UI --> FINDINGS --> REMEDIATION --> LIVE_UI --> URL_UI --> REPORTS
 AUTH_UI -.->|"🔑 JWT"| ROUTERS
 DASH -.-> ROUTERS
 ATTACK_MAP -.-> ROUTERS
 PATHS_UI -.-> ROUTERS
 FINDINGS -.-> ROUTERS
 REMEDIATION -.-> ROUTERS
 LIVE_UI -.-> ROUTERS
 URL_UI -.-> ROUTERS
 REPORTS -.-> ROUTERS
```

---

## 🔗 Data Flow — End to End

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
flowchart LR
 classDef input fill:#0a3d62,stroke:#38c6f4,stroke-width:2px,color:#38c6f4,rx:12
 classDef process fill:#16213e,stroke:#e94560,stroke-width:2px,color:#e0e0e0,rx:12
 classDef output fill:#1a1a2e,stroke:#38c6f4,stroke-width:2px,color:#e0e0e0,rx:12
 classDef store fill:#0f3460,stroke:#f4d03f,stroke-width:2px,color:#f4d03f,rx:12
 classDef arrow stroke:#38c6f4,stroke-width:2px

 subgraph INPUT [📥 INPUT SOURCES]
 direction TB
 IN1["📦 Agent Ingest<br/><i>Assets + Vulns</i>"]
 IN2["🔬 User Scan<br/><i>Auto / Deep Scan</i>"]
 IN3["👁️ Live Discovery<br/><i>DNS · mDNS · ARP</i>"]
 IN4["🌐 URL Check<br/><i>Extension + Web UI</i>"]
 IN5["💬 AI Chat<br/><i>User Query</i>"]
 end

 subgraph PROCESS [⚙️ PROCESSING PIPELINE]
 direction TB
 P1["🔐 Validate + Auth<br/><i>JWT + Bearer Token</i>"]
 P2["📥 Ingest Service<br/><i>Asset + Vuln CRUD</i>"]
 P3["🕸️ Risk Engine<br/><i>NetworkX Graph Build</i>"]
 P4["🔍 Attack Paths<br/><i>Yen's k-Shortest</i>"]
 P5["💰 Impact Pricing<br/><i>$ CVSS × Blast Radius</i>"]
 P6["🔄 Recompute<br/><i>Live Delta</i>"]
 P7["🌐 URL Analyzer<br/><i>Heuristic + ML</i>"]
 P8["🤖 AI Service<br/><i>Multi-provider LLM</i>"]
 P9["🔔 Telegram Notify<br/><i>High/Critical Alerts</i>"]
 end

 subgraph STORAGE [💾 STORAGE]
 direction LR
 S1[(🗄️ Postgres<br/>SQLite dev)]
 S2[(⚡ Redis<br/>Verdict Cache)]
 end

 subgraph OUTPUT [📤 OUTPUT]
 direction TB
 O1["📡 JSON Response<br/><i>REST API</i>"]
 O2["🖥️ Web UI Update<br/><i>React + TanStack Query</i>"]
 O3["🧩 Ext Block / Warn<br/><i>Chrome Redirect</i>"]
 O4["💬 Telegram Push<br/><i>Bot Notification</i>"]
 O5["📋 Ansible Playbook<br/><i>Remediation</i>"]
 end

 class IN1,IN2,IN3,IN4,IN5 input
 class P1,P2,P3,P4,P5,P6,P7,P8,P9 process
 class S1,S2 store
 class O1,O2,O3,O4,O5 output

 IN1 --> P1 --> P2 --> S1
 P2 --> P3 --> P4 --> P5 --> S1
 IN2 --> P1 --> P2
 IN3 --> P1 --> S1
 IN4 --> P1 --> P7 --> S2 --> O3
 IN5 --> P1 --> P8 --> O2
 S1 --> P6 --> S1
 P3 --> P9 --> O4
 P4 --> O5
```

---

## ⚔️ Risk Engine — Attack Path Graph

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
flowchart TD
 classDef internet fill:#e94560,stroke:#ff6b6b,stroke-width:3px,color:#fff,rx:20,font-size:16px
 classDef edge fill:#0a3d62,stroke:#38c6f4,stroke-width:2px,color:#38c6f4,rx:12
 classDef server fill:#16213e,stroke:#e94560,stroke-width:2px,color:#e0e0e0,rx:12
 classDef jewel fill:#f4d03f,stroke:#e94560,stroke-width:3px,color:#1a1a2e,rx:12,font-weight:bold
 classDef vuln fill:#e74c3c,stroke:#ff6b6b,stroke-width:1px,color:#fff,rx:8
 classDef path fill:#0f3460,stroke:#38c6f4,stroke-width:1.5px,color:#38c6f4,rx:10,stroke-dasharray:4 2

 N0(["🌐 INTERNET<br/>━━━━━━━━━━━<br/><i>Attack Source</i>"]):::internet

 N1(["🛡️ Firewall<br/>━━━━━━━━━━━<br/>WAN Edge<br/>pfSense"]):::edge
 PRICE1["$0<br/><i>Entry Point</i>"]

 N2(["🖥️ DMZ Web Server<br/>━━━━━━━━━━━<br/>Apache 2.4.49"]):::server
 VULN2["⚠️ CVE-2021-41773<br/>CVSS 7.5<br/>Path Traversal"]:::vuln
 PRICE2["$45,000"]

 N3(["⚖️ Load Balancer<br/>━━━━━━━━━━━<br/>nginx 1.24"]):::edge
 PRICE3["$12,000"]

 N4(["📱 App Server<br/>━━━━━━━━━━━<br/>Node.js API"]):::server
 VULN4["🔴 CVE-2023-XXXX<br/>CVSS 9.8<br/>RCE"]:::vuln
 PRICE4["$180,000"]

 N5(["🗄️ Database<br/>━━━━━━━━━━━<br/>PostgreSQL 15<br/>👑 CROWN JEWEL"]):::jewel
 PRICE5["$500,000"]

 N6(["📊 Monitoring<br/>━━━━━━━━━━━<br/>Prometheus"]):::edge
 PRICE6["$8,000"]

 subgraph PATHS [📊 Computed Attack Paths]
 direction TB
 PATH1["⚡ Path 1<br/>━━━━━━━━━━━<br/>INTERNET → FW → DMZ<br/>Cost: <b>$45,000</b><br/>1 exploit · ⚠️ Medium"]:::path
 PATH2["🔥 Path 2<br/>━━━━━━━━━━━<br/>INTERNET → FW → DMZ → LB → APP<br/>Cost: <b>$180,000</b><br/>2 exploits · 🔴 High"]:::path
 PATH3["💀 Path 3 — CRITICAL<br/>━━━━━━━━━━━<br/>INTERNET → FW → DMZ → APP → DB<br/>Cost: <b>$500,000</b><br/>3 exploits · 👑 Crown Jewel"]:::path
 PATH4["⚡ Path 4<br/>━━━━━━━━━━━<br/>INTERNET → FW → MON<br/>Cost: <b>$8,000</b><br/>1 exploit · ⚠️ Low"]:::path
 end

 N0 ==>|"HTTPS :443"| N1
 N1 == Port 80/443 ==> N2
 N1 == HTTPS :443 ==> N3
 N3 == HTTP :3000 ==> N4
 N4 == TCP 5432 ==> N5
 N1 == SNMP 161 ==> N6

 N2 -.->|"Exploit"| PATH1
 N4 -.->|"Exploit Chain"| PATH2
 N5 -.->|"Full Breach"| PATH3
 N6 -.->|"Exploit"| PATH4
```

---

## 🌐 Network Topology — Live Watch

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
graph TB
 classDef internet fill:#e94560,stroke:#ff6b6b,stroke-width:3px,color:#fff,rx:20
 classDef infra fill:#0a3d62,stroke:#38c6f4,stroke-width:2px,color:#38c6f4,rx:12
 classDef device fill:#16213e,stroke:#f4d03f,stroke-width:1.5px,color:#e0e0e0,rx:10
 classDef deviceOnline fill:#16213e,stroke:#2ecc71,stroke-width:1.5px,color:#2ecc71,rx:10
 classDef deviceWarn fill:#16213e,stroke:#f39c12,stroke-width:1.5px,color:#f39c12,rx:10
 classDef deviceOff fill:#16213e,stroke:#e74c3c,stroke-width:1.5px,color:#e74c3c,rx:10
 classDef discovery fill:#0f3460,stroke:#9b59b6,stroke-width:1.5px,color:#9b59b6,rx:10

 ATTACK(["🌍 Internet<br/>Attacker Surface"]):::internet

 subgraph PERIMETER [🔒 Perimeter — 192.168.0.0/16]
 RTR(["📡 Router<br/>192.168.1.1<br/>OpenWrt 23.05"]):::infra
 FW(["🛡️ Firewall<br/>192.168.1.2<br/>pfSense 2.7"]):::infra
 end

 subgraph LAN [🏢 LAN — 192.168.1.0/24]
 SRV1(["🖥️ App Server<br/>192.168.1.10<br/>🟢 ONLINE"]):::deviceOnline
 SRV2(["🗄️ DB Server<br/>192.168.1.20<br/>🟢 ONLINE"]):::deviceOnline
 SRV3(["📁 NAS / Files<br/>192.168.1.30<br/>🟡 DEGRADED"]):::deviceWarn
 WS1(["💻 Workstation<br/>192.168.1.100<br/>🟢 ONLINE"]):::deviceOnline
 WS2(["💻 Dev Machine<br/>192.168.1.101<br/>🔴 OFFLINE"]):::deviceOff
 PRT1(["🖨️ Printer<br/>192.168.1.50<br/>🟡 DEGRADED"]):::deviceWarn
 MOB1(["📱 iPhone<br/>192.168.1.200<br/>🟢 ONLINE"]):::deviceOnline
 end

 subgraph IOT [🏠 IoT — 192.168.2.0/24]
 CAM1(["📷 Camera 01<br/>192.168.2.10<br/>🟡 DEGRADED"]):::deviceWarn
 CAM2(["📷 Camera 02<br/>192.168.2.11<br/>🟢 ONLINE"]):::deviceOnline
 TSTAT(["🌡️ Thermostat<br/>192.168.2.20<br/>🔴 OFFLINE"]):::deviceOff
 end

 subgraph AGENT_METHODS [👁️ Agent Discovery Methods]
 DNS_M["🔍 DNS Queries<br/><i>Passive monitoring</i>"]
 MDNS_M["📡 mDNS Discovery<br/><i>_http._tcp.local</i>"]
 ARP_M["📋 ARP Table<br/><i>Subnet scan</i>"]
 WIFI_M["📶 WiFi Scan<br/><i>Cross-platform</i>"]
 end

 ATTACK --> RTR
 RTR <--> FW
 FW <--> SRV1 & SRV2 & SRV3 & WS1 & WS2 & PRT1 & MOB1
 FW <--> CAM1 & CAM2 & TSTAT

 DNS_M -.->|"resolves"| WS1 & SRV1
 MDNS_M -.->|"discovers"| CAM1 & SRV1
 ARP_M -.->|"scans"| SRV1 & SRV2
 WIFI_M -.->|"finds"| MOB1 & WS2
```

---

## 🔐 Authentication & Security Flow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
sequenceDiagram
 actor U as 👤 User
 actor EXT as 🧩 Extension
 participant UI as 🌐 Web UI
 participant API as 🖥️ FastAPI Server
 participant DB as 🗄️ Database
 participant CACHE as ⚡ Redis Cache
 participant LLM as 🧠 LLM Provider
 participant TG as 💬 Telegram Bot

 %% ── Login Flow ──
 rect rgb(15, 52, 96)
 Note over U,API: 🔐 AUTHENTICATION
 U->>UI: Enter email + password
 UI->>API: POST /api/auth/login<br/>{email, password}
 API->>DB: bcrypt verify + lookup
 DB-->>API: User record + org
 API->>API: Create JWT<br/>(access: 15m, refresh: 7d)
 API-->>UI: {access_token, refresh_token}
 UI->>UI: Store tokens<br/>(memory + localStorage)
 end

 %% ── API Call Flow ──
 rect rgb(26, 26, 46)
 Note over UI,DB: 📡 API REQUEST / RESPONSE
 U->>UI: Navigate to Dashboard
 UI->>API: GET /api/dashboard<br/>Authorization: Bearer {token}
 API->>API: Validate JWT<br/>(python-jose)
 API->>API: Rate limit check
 API->>DB: Query org-scoped data
 DB-->>API: Exposure metrics
 API-->>UI: JSON response
 UI->>UI: TanStack Query cache update
 end

 %% ── Token Refresh ──
 rect rgb(10, 61, 98)
 Note over UI,API: 🔄 TOKEN REFRESH
 UI->>API: GET /api/findings (401)
 UI->>API: POST /api/auth/refresh
 API->>API: Validate refresh token
 API-->>UI: {access_token: new}
 UI->>API: Retry GET /api/findings<br/>with new token
 API-->>UI: {findings: [...]}
 end

 %% ── AI Chat Flow ──
 rect rgb(15, 52, 96)
 Note over UI,LLM: 🤖 AI ASSISTANT
 U->>UI: "Explain finding #12"
 UI->>API: POST /api/ai/chat<br/>Bearer {token}
 API->>API: Auth + rate limit
 API->>LLM: Stream completion<br/>(Groq Llama 3.3 / Claude)
 LLM-->>API: Streamed tokens
 API-->>UI: {response: "..."}
 end

 %% ── Extension Flow ──
 rect rgb(10, 61, 98)
 Note over EXT,API: 🧩 EXTENSION AUTH
 EXT->>API: POST /api/auth/login<br/>(from options page)
 API-->>EXT: {access_token}
 EXT->>EXT: chrome.storage.local.set
 end

 %% ── URL Analysis Flow ──
 rect rgb(26, 26, 46)
 Note over EXT,EXT: 🌐 URL ANALYSIS (Extension)
 EXT->>EXT: chrome.webNavigation<br/>onBeforeNavigate fires
 EXT->>EXT: Check allowlist + cache
 EXT->>API: POST /api/url-analyzer/analyze<br/>Bearer {token}
 API->>CACHE: Check verdict cache (TTL 10m)
 alt Cache Hit
 CACHE-->>API: {band, score, reasons}
 else Cache Miss
 API->>API: Heuristic + ML scoring
 API->>CACHE: Store result (TTL 10m)
 end
 API-->>EXT: {band: "High Risk"}
 alt band == "High Risk"
 EXT->>EXT: 🔴 Redirect → warning.html
 else band == "Caution"
 EXT->>EXT: 🟡 Amber badge
 else band == "Trusted"
 EXT->>EXT: 🟢 Teal badge → continue
 end
 end

 %% ── Alert Flow ──
 rect rgb(233, 69, 96)
 Note over API,TG: 🔔 TELEGRAM ALERTS
 API->>API: Scan for high/critical findings
 API->>TG: Send notification
 TG-->>U: 📱 "Critical: CVE-2023-XXXX on app server"
 end
```

---

## 🔄 Recompute & Exposure Tracking

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
flowchart TD
 classDef trigger fill:#e94560,stroke:#ff6b6b,stroke-width:2px,color:#fff,rx:12
 classDef step fill:#16213e,stroke:#38c6f4,stroke-width:1.5px,color:#e0e0e0,rx:10
 classDef result fill:#0f3460,stroke:#f4d03f,stroke-width:2px,color:#f4d03f,rx:10

 subgraph TRIGGERS [⚡ Trigger Events]
 direction LR
 T1["✅ Finding<br/>Resolved"]:::trigger
 T2["🆕 New Finding<br/>Created"]:::trigger
 T3["🖥️ New Asset<br/>Discovered"]:::trigger
 T4["🔧 Vuln<br/>Patched"]:::trigger
 T5["🗑️ Asset<br/>Removed"]:::trigger
 end

 subgraph PIPELINE [⚙️ Recompute Pipeline — 7 Steps]
 direction TB
 S1["1️⃣ Load Org Assets<br/><i>All nodes in org graph</i>"]:::step
 S2["2️⃣ Rebuild NetworkX<br/><i>Directed DiGraph</i>"]:::step
 S3["3️⃣ Yen's k-Shortest<br/><i>All INTERNET → jewel paths</i>"]:::step
 S4["4️⃣ Price Each Path<br/><i>$ CVSS × blast radius</i>"]:::step
 S5["5️⃣ Min-Cut Analysis<br/><i>Critical routes</i>"]:::step
 S6["6️⃣ Aggregate Exposure<br/><i>Total $ at risk</i>"]:::step
 S7["7️⃣ Store + Emit<br/><i>Updated metrics</i>"]:::step
 end

 subgraph RESULTS [📊 Results Dashboard]
 direction LR
 R1["💰 Total Exposure<br/><b>$702,900</b>"]:::result
 R2["📈 Top Risk Path<br/><b>3 hops</b>"]:::result
 R3("👑 Crown Jewels<br/><b>2 flagged</b>"):::result
 R4["📉 Trend<br/><b>↓ 22%</b>"):::result
 R5["🚨 Open Findings<br/><b>23</b>"):::result
 end

 T1 & T2 & T3 & T4 & T5 --> S1
 S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
 S7 --> R1 & R2 & R3 & R4 & R5
```

---

## 🔬 Risk Scoring Model

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'edgeLabelBackground':'#16213e', 'tertiaryColor': '#0f3460', 'primaryTextColor': '#e0e0e0', 'lineColor': '#38c6f4', 'secondaryColor': '#1a1a2e', 'tertiaryColor': '#0f3460'}}}%%
flowchart LR
 classDef factor fill:#16213e,stroke:#38c6f4,stroke-width:2px,color:#e0e0e0,rx:12
 classDef weight fill:#e94560,stroke:#ff6b6b,stroke-width:1.5px,color:#fff,rx:8
 classDef formula fill:#0f3460,stroke:#f4d03f,stroke-width:2px,color:#f4d03f,rx:12

 subgraph INPUTS [📥 Scoring Inputs]
 direction TB
 F1["📋 CVSS Base Score<br/>0.0 – 10.0"]:::factor
 F2["💎 Asset Criticality<br/>1× – 5× multiplier"]:::factor
 F3["🌐 Exposure Score<br/>Public vs Segmented"]:::factor
 F4["💥 Blast Radius<br/>Downstream impact"]:::factor
 end

 subgraph WEIGHTS [⚖️ Weights]
 direction LR
 W1["40%"]:::weight
 W2["30%"]:::weight
 W3["20%"]:::weight
 W4["10%"]:::weight
 end

 subgraph CALC [🧮 Formula]
 direction TB
 FORMULA["Node Price = (CVSS × 0.40) +<br/>(Criticality × 0.30) +<br/>(Exposure × 0.20) +<br/>(BlastRadius × 0.10)"]:::formula
 PATH_COST["Path Cost = Σ(Exploit Cost)<br/>+ Blast Radius × Crown Jewel"]:::formula
 end

 subgraph OUTPUT [📤 Output]
 direction LR
 O1["🎯 Node Score"]
 O2["💰 $ Price"]
 O3["⚠️ Severity<br/>Critical/High/Med/Low"]
 end

 F1 --> W1
 F2 --> W2
 F3 --> W3
 F4 --> W4
 W1 & W2 & W3 & W4 --> FORMULA
 FORMULA --> PATH_COST
 PATH_COST --> O1 & O2 & O3
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with `uv` or `pip`
- **Node.js 18+** with `npm`
- **Redis** (optional, for caching — falls back to memory)

### Backend

```bash
# 1. Clone and enter
git clone https://github.com/<org>/drishti.git && cd drishti

# 2. Start the server (auto-seeds demo org on first boot)
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env # adjust as needed
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server running at **http://localhost:8000**

### Web Frontend

```bash
cd web
npm install
npm run dev
```

Web UI at **http://localhost:5173**

### Edge Agent

```bash
# Device discovery + live watch
python agent/drishti_watch.py --mode devices \
 --discover-wifi --server http://localhost:8000 \
 --token agent-demo-token

# One-shot fixture ingest (demo)
python agent/drishti_agent.py --once \
 --fixture server/app/seed/fixtures/db-prod-01.json \
 --server http://localhost:8000 \
 --token agent-demo-token
```

### Chrome Extension

1. `chrome://extensions` → toggle **Developer mode**
2. **Load unpacked** → select `extension/` folder
3. Open options → configure server URL → log in

**Demo credentials:** `analyst@acme-retail.dev` / `drishti-demo`

---

## 🛠️ Full Tech Stack

### Backend — Server

| Layer | Technology |
|---|---|
| **Framework** | FastAPI 0.115 |
| **ORM** | SQLAlchemy 2.0 + Alembic |
| **Auth** | python-jose (JWT 15m/7d) + bcrypt |
| **Graph Engine** | NetworkX 3.4 |
| **ML/Stats** | scikit-learn, numpy, scipy |
| **Scheduling** | APScheduler (deep scan) |
| **Monitoring** | prometheus-client, psutil |
| **Parsing** | beautifulsoup4, lxml, bleach |
| **CVE Data** | nvdlib (NVD API) |
| **Feeds** | feedparser, dnspython |

### Frontend — Web

| Layer | Technology |
|---|---|
| **Framework** | React 18.3 + TypeScript |
| **Build** | Vite 5 + Code Splitting |
| **Styling** | Tailwind CSS 3.4 |
| **State** | Zustand 4.5 (client) + TanStack Query 5.51 (server) |
| **Graph** | ReactFlow 11.11 (attack map) |
| **Charts** | Recharts 2.12 |
| **Animation** | Framer Motion 12.42 |
| **Icons** | Lucide React |
| **Testing** | Vitest + Testing Library |

### Edge — Agent + Extension

| Component | Stack |
|---|---|
| **Edge Agent** | Python stdlib-only (zero external deps) |
| **Chrome Extension** | Manifest V3, service worker, chrome.storage |

---

## 📁 Repository Map

```
drishti/
├── 📄 README.md ← you are here
├── ⚙️ .env.example # Environment template
├── 📦 package.json # Root (legacy web frontend)
│
├── 🖥️ server/ # FastAPI Backend
│ ├── 🐍 run.py # uvicorn entrypoint
│ ├── 📋 requirements.txt # Python deps
│ ├── 📋 pyproject.toml # Build config (hatchling)
│ ├── 🗄️ drishti.db # SQLite (dev)
│ │
│ └── 📁 app/
│ ├── 🚀 main.py # App assembly · lifespan · middleware
│ ├── ⚙️ config.py # Env-driven settings (pydantic-settings)
│ ├── 🗄️ db.py # SQLAlchemy engine + session factory
│ ├── 🔧 db_init.py # Schema column reconciliation
│ │
│ ├── 📁 api/v1/ # 16 REST Routers
│ │ ├── health.py # Health check
│ │ ├── auth.py # JWT login / refresh / me
│ │ ├── org.py # Organization CRUD
│ │ ├── ingest.py # Agent data ingestion
│ │ ├── assets.py # Asset management
│ │ ├── findings.py # Vulnerability findings
│ │ ├── graph.py # Network graph data
│ │ ├── paths.py # Attack path computation
│ │ ├── ai.py # LLM chat + analysis
│ │ ├── dashboard.py # Exposure metrics
│ │ ├── report.py # Full org report
│ │ ├── live.py # Real-time telemetry
│ │ ├── netconfig.py # Network config export
│ │ ├── urltrust.py # URL reputation
│ │ └── scan.py # Deep scan triggers
│ │
│ ├── 📁 models/ # 10 SQLAlchemy ORM Models
│ │ ├── org.py # Organization + membership
│ │ ├── asset.py # Network assets
│ │ ├── vuln.py # Vulnerabilities
│ │ ├── finding.py # Risk findings
│ │ ├── path.py # Attack paths
│ │ ├── scan.py # Scan sessions
│ │ ├── remediation.py # Remediation actions
│ │ ├── live.py # Live device data
│ │ ├── netconfig.py # Network config
│ │ └── urltrust.py # URL trust entries
│ │
│ ├── 📁 schemas/ # Pydantic DTOs
│ ├── 📁 services/ # 9 Business-Logic Modules
│ │ ├── risk_engine.py # NetworkX graph engine
│ │ ├── attack_paths.py # Yen's k-shortest paths
│ │ ├── impact.py # $ pricing model
│ │ ├── recompute.py # Live exposure delta
│ │ ├── ingest.py # Agent payload processing
│ │ ├── urltrust/ # URL scoring (heuristic + ML)
│ │ ├── deepscan/ # Autonomous nmap scanner
│ │ ├── netconfig/ # Network config generation
│ │ ├── live.py # Live watch orchestration
│ │ ├── live_threats.py # Threat feed integration
│ │ ├── autoscan.py # Scheduled deep-scan triggers
│ │ ├── hardening.py # Ansible playbook generation
│ │ └── telegram_alerts.py # Telegram push notifications
│ │
│ ├── 📁 core/ # Core Infrastructure
│ │ ├── security.py # JWT + bcrypt helpers
│ │ ├── deps.py # Auth/rate-limit dependencies
│ │ └── errors.py # Error envelope + handlers
│ │
│ ├── 📁 seed/ # Demo Data
│ │ ├── acme.py # Acme Retail demo network
│ │ └── fixtures/ # JSON scan fixtures
│ │
│ └── 📁 scripts/ # Maintenance utilities
│
├── 🌐 web/ # React SPA (Vite + TypeScript)
│ ├── src/
│ │ ├── App.tsx # Root router + providers
│ │ ├── 📁 features/ # 12 Feature Modules
│ │ │ ├── landing/ # Marketing hero page
│ │ │ ├── auth/ # Login + Signup
│ │ │ ├── dashboard/ # Exposure overview + KPIs
│ │ │ ├── graph/ # 🕸️ Attack Map (ReactFlow)
│ │ │ ├── paths/ # 🔍 Breach Simulation
│ │ │ ├── findings/ # 🚨 Severity-ranked table
│ │ │ ├── remediation/ # 🛠️ 3-Column Ansible Studio
│ │ │ ├── live/ # 📡 Force-directed live map
│ │ │ ├── report/ # 📋 Reports + NetConfig
│ │ │ ├── settings/ # ⚙️ Org settings
│ │ │ └── urltrust/ # 🌐 URL Analyzer UI
│ │ ├── 📁 api/ # TypeScript API clients
│ │ ├── 📁 store/ # Zustand state stores
│ │ ├── 📁 components/ # Shared UI components
│ │ ├── 📁 lib/ # Utilities + helpers
│ │ └── 📁 styles/ # Tailwind + global CSS
│ ├── package.json
│ ├── vite.config.ts
│ └── Dockerfile
│
├── 👁️ agent/ # Edge Agent (stdlib-only Python)
│ ├── drishti_watch.py # Live watch daemon
│ │ # (DNS/history/conn/devices modes)
│ └── drishti_agent.py # Snapshot ingester
│ # (Fixture replay + POST to /api/ingest)
│
├── 🧩 extension/ # Chrome Web Guard (MV3)
│ ├── manifest.json # MV3 manifest (minimal permissions)
│ ├── background.js # Service worker (nav gate + cache)
│ ├── options.html / .js # Server URL + login UI
│ ├── warning.html / .js / .css # Block page (redirect target)
│ └── README.md # Extension docs + demo script
│
└── 📚 Drishti Docs/ # Full Documentation Suite
 ├── PRD.md # Product Requirements
 ├── TRD.md # Technical Requirements + Formulas
 ├── ARCHITECTURE.md # C4 Diagrams + Design Decisions
 ├── APP_FLOW.md # Sequence Diagrams (All Journeys)
 ├── DATA_MODEL.md # ER Diagram + 21-Table Dictionary
 ├── API_REFERENCE.md # Every Endpoint Documented
 ├── SECURITY_MODEL.md # Defensive-Only Stance + Auth
 └── UIUX.md # Design System Specification
```

---

## 🧪 Testing

```bash
# ── Backend (232+ tests) ──
cd server
source .venv/bin/activate
pytest --tb=short -v

# ── Frontend ──
cd web
npm test

# ── Live Watch ──
python agent/drishti_watch.py --once \
 --fixture server/app/seed/fixtures/db-prod-01.json \
 --server http://localhost:8000 \
 --token agent-demo-token
```

---

## 📊 Demo Network — Acme Retail

| Asset | Type | CVSS | Dollar Value | Status |
|---|---|---|---|---|
| `web.acme-retail.dev` | DMZ Web Server | 7.5 | **$45,000** | 🟢 Online |
| `api.acme-retail.dev` | App Server | 9.8 | **$180,000** | 🟢 Online |
| `db.acme-retail.dev` | Database (Crown Jewel) | 9.1 | **$500,000** | 🟢 Online |
| `mail.acme-retail.dev` | Mail Server | 6.1 | **$15,000** | 🟡 Degraded |
| `vpn.acme-retail.dev` | VPN Gateway | 7.8 | **$90,000** | 🟢 Online |
| `monitor.acme-retail.dev` | Monitoring | 4.3 | **$8,000** | 🟢 Online |
| **Total Exposure** | | | **$902,900** | |

Login: `analyst@acme-retail.dev` / `drishti-demo`

---

## 📚 Documentation

| Document | Description |
|---|---|
| [PRD.md](Drishti%20Docs/PRD.md) | Product Requirements — problem, personas, goals |
| [TRD.md](Drishti%20Docs/TRD.md) | Technical Requirements — stack, formulas, service specs |
| [ARCHITECTURE.md](Drishti%20Docs/ARCHITECTURE.md) | C4 diagrams, design decisions, repo map |
| [APP_FLOW.md](Drishti%20Docs/APP_FLOW.md) | Sequence diagrams for all user journeys |
| [DATA_MODEL.md](Drishti%20Docs/DATA_MODEL.md) | ER diagram, 21-table dictionary |
| [API_REFERENCE.md](Drishti%20Docs/API_REFERENCE.md) | Every endpoint (method, auth, request/response) |
| [SECURITY_MODEL.md](Drishti%20Docs/SECURITY_MODEL.md) | Defensive-only stance, consent gating, auth internals |

---

## 🤝 Contributing

1. Fork → `git checkout -b feat/amazing-feature`
2. Commit → `git commit -m 'feat: add amazing feature'`
3. Push → `git push origin feat/amazing-feature`
4. Open PR — all 232+ backend tests + frontend Vitest must pass

---

<div align="center">

**Drishti** &nbsp;👁️&nbsp; See the invisible. Price the risk. Fix it first.

*Defensive only. Maps, prices, and remediates. Never attacks.*

</div>
