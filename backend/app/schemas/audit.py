"""
audit.py — Pydantic schemas for the Contact / Audit request pipeline.
Revamp: accepts name/email/problem/notes from the "Get My Free Automation Audit" form.
Mirrors frontend Zod contract in src/lib/validations/audit.ts field-for-field.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field, EmailStr


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    problem: Literal[
        "Pricing / competitor blindness",
        "Lead generation",
        "Slow support / knowledge access",
        "Something else",
    ]
    notes: Optional[str] = Field(default=None, max_length=1000)


class AuditResponse(BaseModel):
    status: str
    job_id: str
    message: str
