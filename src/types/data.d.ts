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

export interface RootConfig {
  telemetry: SystemTelemetry;
  services: ServiceMatrix[];
  deployments: OperationalDeployment[];
  labs: ProjectLab[];
  links: LinkNode[];
}