"""
audit.py — FastAPI router for the Contact / Audit request pipeline.
Revamp: accepts ContactRequest (name/email/problem/notes), mints a UUID job token,
returns HTTP 202 Accepted.
Phase 3 hook: Celery task dispatch / email notification is present but commented out.
"""

import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.audit import ContactRequest, AuditResponse

# Phase 3 import — uncomment when notification/CRM integration is wired:
# from app.worker.tasks import dispatch_contact_notification

router = APIRouter(prefix="/api/audit", tags=["Contact"])


@router.post(
    "/analyze",
    response_model=AuditResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit a contact / free audit request",
    description=(
        "Accepts a validated contact payload (name, email, problem area, optional notes), "
        "mints a UUID job token, and returns immediately with 202 Accepted. "
        "Phase 3: wire to email/CRM notification here."
    ),
)
async def submit_contact(payload: ContactRequest) -> AuditResponse:
    try:
        job_id = str(uuid.uuid4())

        # ── Phase 3 hook ─────────────────────────────────────────────────────
        # dispatch_contact_notification.delay(job_id, payload.model_dump())
        # ─────────────────────────────────────────────────────────────────────

        return AuditResponse(
            status="processing",
            job_id=job_id,
            message="CONTACT_RECEIVED",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="INTERNAL_ERROR",
        ) from exc


@router.get(
    "/status/{job_id}",
    summary="Poll contact request status",
    description=(
        "Returns the current state of a submitted contact request. "
        "Phase 3 will read live state from Redis/CRM backend."
    ),
)
async def check_status(job_id: str) -> dict:
    # ── Phase 3 hook ─────────────────────────────────────────────────────────
    # result = AsyncResult(job_id, app=celery_app)
    # return {"job_id": job_id, "status": result.state, ...}
    # ─────────────────────────────────────────────────────────────────────────
    return {
        "job_id": job_id,
        "status": "PENDING",
        "message": "Awaiting processing.",
    }
