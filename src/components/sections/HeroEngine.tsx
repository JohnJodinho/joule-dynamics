/**
 * HeroEngine.tsx
 * Revamp: copy now pulled entirely from config.json's hero key.
 * Structural grid preserved; headline/subheadline/CTA updated for buyer framing.
 */
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { hero } = config as unknown as RootConfig;

export default function HeroEngine() {
  return (
    <section className="relative border-x border-b border-border overflow-hidden">
      {/* Industrial grid mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow — primary cyan tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, hsl(199 89% 48% / 0.12), transparent 70%)",
        }}
      />

      <div className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-0">
        {/* ── Credential micro-badge ── */}
        <div className="mb-8">
          <code className="inline-flex flex-wrap items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            <span className="text-primary">▸</span>
            <span>B.ENG. MECHANICAL ENGINEERING (FIRST CLASS)</span>
            <span className="opacity-40">//</span>
            <span className="text-accent">AZURE AI-102 CERTIFIED</span>
          </code>
        </div>

        {/* ── Main headline — from config.hero ── */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground max-w-4xl">
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-primary) 0%, hsl(199 89% 68%) 100%)",
            }}
          >
            {hero.headline}
          </span>
        </h1>

        {/* ── Subheadline — from config.hero ── */}
        <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
          {hero.subheadline}
        </p>

        {/* ── CTA row ── */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 font-semibold tracking-wide"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "hsl(199 89% 42%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-primary)")
            }
            asChild
          >
            <a href={hero.primaryCtaLink} id="hero-primary-cta">
              {hero.primaryCtaLabel}
              <ArrowRight className="size-4" />
            </a>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
            asChild
          >
            <a href="#solutions" id="hero-secondary-cta">
              See the solutions
            </a>
          </Button>
        </div>

        {/* ── Bottom telemetry strip ── */}
        <div className="mt-16 pt-6 border-t border-border flex flex-wrap gap-x-8 gap-y-2">
          {[
            { label: "STACK", value: "React 19 · FastAPI · LangChain · Playwright" },
            { label: "INFRA", value: "Docker · K8s · Azure AI · Pinecone" },
            { label: "SLA", value: "99.98% UPTIME · 42ms P95 LATENCY" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {label}
              </span>
              <span className="text-[10px] opacity-30 text-muted-foreground">/</span>
              <span className="font-mono text-[10px] text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
