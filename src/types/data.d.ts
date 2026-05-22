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
  category: "Agentic RAG" | "Enterprise Scraping";
  liveUrl: string;
  architecture: string[];
  terminalPayload: string;
}

export interface RootConfig {
  telemetry: SystemTelemetry;
  services: ServiceMatrix[];
  labs: ProjectLab[];
}
