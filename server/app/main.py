"""Drishti — AI-Powered Network Risk Simulator."""
from __future__ import annotations

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import engine
from app.db_init import init_db
from app.api.v1 import health, auth, assets, graph, paths, dashboard, live, ai, scan, intel, findings, reports, urltrust, admin, remediation


@asynccontextmanager
async def lifespan(app: FastAPI):
 # Startup: initialize database with demo data
 t0 = time.perf_counter()
 init_db()
 print(f"DB initialized in {(time.perf_counter() - t0) * 1000:.1f}ms")
 yield
 # Shutdown: dispose DB connections
 engine.dispose()


app = FastAPI(title="Drishti", description="AI-Powered Network Risk Simulator", lifespan=lifespan)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
 CORSMiddleware,
 allow_origins=origins or ["http://localhost:5173"],
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],
)


# Routers
app.include_router(health.router, tags=["health"])
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(graph.router)
app.include_router(paths.router)
app.include_router(dashboard.router)
app.include_router(live.router)
app.include_router(ai.router)
app.include_router(scan.router)
app.include_router(intel.router)
app.include_router(findings.router)
app.include_router(reports.router)
app.include_router(urltrust.router)
app.include_router(admin.router)
app.include_router(remediation.router)


@app.get("/")
def root():
 return {"name": "Drishti", "version": "1.0.0", "docs": "/docs"}
