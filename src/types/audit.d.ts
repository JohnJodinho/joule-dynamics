/**
 * audit.d.ts
 * Strict API contract for the Joule Dynamics Contact / Audit Request pipeline.
 * Revamp: updated to match the "Get My Free Automation Audit" marketing form.
 * Mirrors backend ContactRequest (backend/app/schemas/audit.py) and
 * frontend Zod schema (lib/validations/audit.ts) field-for-field.
 */

export interface ContactHandshakePayload {
  name: string;
  email: string;
  problem:
    | "Pricing / competitor blindness"
    | "Lead generation"
    | "Slow support / knowledge access"
    | "Something else";
  notes?: string;
}

export interface AuditHandshakeResponse {
  status: "processing" | "failed";
  job_id?: string;
  message: string;
}
