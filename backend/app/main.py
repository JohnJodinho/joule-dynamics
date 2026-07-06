"""
main.py — Joule Dynamics AI Engine root application.
Initialises FastAPI, enforces strict CORS for the Vite frontend,
and mounts all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.audit import router as audit_router

app = FastAPI(
    title="Joule Dynamics AI Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Scoped to the local Vite dev server for Phase 2.
# Phase 9: swap localhost entry for the production domain.
origins = [
    "http://localhost:5173",          # Local Vite dev server
    "https://joule-dynamics.vercel.app",  # Vercel production
    # "https://your-custom-domain.com",  # Phase 9: custom domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(audit_router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check() -> dict:
    return {"status": "ACTIVE", "engine": "JOULE_CORE"}
