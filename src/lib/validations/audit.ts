/**
 * audit.ts — Zod Validation Schema
 * Revamp: contact/audit request form for the "Get My Free Automation Audit" CTA.
 * Fields: name, email, problem (select), notes (optional textarea).
 * Mirrors backend/app/schemas/audit.py ContactRequest exactly.
 */

import * as z from "zod";

export const auditFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Please enter your name." })
    .max(100, { message: "Name is too long." }),

  email: z
    .string()
    .email({ message: "Please enter a valid work email address." }),

  problem: z.enum(
    [
      "Pricing / competitor blindness",
      "Lead generation",
      "Slow support / knowledge access",
      "Something else",
    ],
    {
      error: "Please select the area that's costing you the most right now.",
    }
  ),

  notes: z.string().max(1000, { message: "Please keep notes under 1000 characters." }).optional(),
});

export type AuditFormValues = z.infer<typeof auditFormSchema>;
