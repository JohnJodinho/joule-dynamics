export interface Service {
  id: string;
  title: string;
  desc: string;
}

export interface Brand {
  name: string;
  tagline: string;
  description: string;
  founder: {
    name: string;
    credentials: string;
  };
  services: Service[];
  projects: string[];
  contact: {
    linkedin: string;
    whatsapp: string;
    X: string;
  };
}

export const BRAND: Brand = {
  name: "Joule Dynamics",
  tagline: "Engineering Agentic Workflows for High-Stakes Industries",
  description: "Enterprise-grade AI infrastructure, Resilient Web Scraping, and Agentic RAG systems.",
  founder: {
    name: "Jodi",
    credentials: "B.Eng. Mechanical Engineering (First Class), Azure AI-102",
  },
  services: [
    { id: "rag", title: "Agentic RAG", desc: "Reasoning-based AI for Legal, Medical, and SaaS." },
    { id: "scraping", title: "Resilient Web Scraping", desc: "Detection-bypass data pipelines." },
    { id: "infra", title: "AI Infrastructure", desc: "Autonomous agent integration." }
  ],
  projects: ["SentimentScope", "Enterprise Scrapers"],
  contact: { linkedin: "#", whatsapp: "#" , X: "#"}
};
