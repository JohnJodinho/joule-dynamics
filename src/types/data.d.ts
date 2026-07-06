// ─────────────────────────────────────────────────────────────────────────────
// Existing portfolio interfaces (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemTelemetry {
  uptime: string;
  latencyMs: number;
  status: "ACTIVE" | "MAINTENANCE";
}

export interface ServiceMatrix {
  id: string;
  title: string;
  description: string;
  stack: string[];
  roiVector: string;
}

export interface ProjectLab {
  id: string;
  title: string;
  category: "Agentic RAG" | "Enterprise Scraping" | "Model Fine-Tuning";
  description: string;
  metrics: string[];
  liveUrl: string;
  buttonLabel: string;
  architecture: string[];
  terminalPayload: string;
}

export interface OperationalDeployment {
  id: string;
  role: string;
  organization: string;
  timeline: string;
  metrics: string[];
}

export interface LinkNode {
  id: string;
  label: string;
  href: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Solutions Showcase interfaces (revamp additions)
// ─────────────────────────────────────────────────────────────────────────────

export type MetricType = "revenue" | "time" | "conversion" | "market" | "other";

export interface ROIMetric {
  label: string;        // e.g. "Margin Recovery"
  value: string;        // e.g. "8–14%"
  context?: string;     // e.g. "in 12 months"
  metricType: MetricType;
  isBenchmark: boolean; // true → "Industry Benchmark" pill; false → verified client result
}

export interface DemoAsset {
  kind: "video" | "screenshot" | "interactive";
  url: string;
  posterImage?: string;
  altText: string;
  durationSeconds?: number;
  fallbackNote?: string; // shown when kind is "screenshot" as a placeholder overlay
}

export interface Solution {
  id: string;               // slug — used as React key + anchor link
  order: number;            // controls display order in the grid
  isPublished: boolean;     // toggle visibility without deleting the entry
  category: string;         // e.g. "Web Scraping & Data Intelligence"
  title: string;            // outcome-oriented headline
  problemStatement: string;
  solutionDescription: string;
  demo: DemoAsset;
  roiMetrics: ROIMetric[];
  techStackTags: string[];  // shown in collapsed "Under the hood" panel
  ctaLabel: string;
  ctaLink: string;          // can point to #contact or an external demo link
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact / audit form interfaces (revamp additions)
// ─────────────────────────────────────────────────────────────────────────────

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  required: boolean;
  options?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified root config type (extends existing keys with new ones)
// ─────────────────────────────────────────────────────────────────────────────

export interface RootConfig {
  // Existing keys
  telemetry: SystemTelemetry;
  services: ServiceMatrix[];
  deployments: OperationalDeployment[];
  labs: ProjectLab[];
  links: LinkNode[];

  // Revamp additions
  devHub: {
    badgeLabel: string;
    tooltip: string;
  };
  meta: {
    title: string;
    description: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    primaryCtaLink: string;
  };
  solutions: Solution[];
  howItWorks: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  about: {
    headline: string;
    bio: string;
    credentials: string[];
    photoUrl?: string;
  };
  contact: {
    headline: string;
    subheadline: string;
    fields: FormField[];
    submitLabel: string;
    trustLine: string;
  };
}