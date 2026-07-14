/**
 * OperationalHistory.tsx
 * Repurposed (revamp): now renders the "How This Works" 3-step process strip.
 * Content is driven entirely by config.json's howItWorks array.
 */
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";
import { SectionHeader } from "@/components/ui/SectionHeader";

const { howItWorks } = config as unknown as RootConfig;

export default function OperationalHistory() {
  return (
    <section id="how-it-works" className="py-16 border-b border-border">
      {/* ── Section identifier ── */}
      <div className="flex items-center gap-3 mb-10">
        <SectionHeader sectionId="how-it-works" />
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* ── 3-step strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {howItWorks.map((step) => (
          <div key={step.step} className="flex flex-col gap-4">
            {/* Step number */}
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-black shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, hsl(199 89% 68%) 100%)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {step.step}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground leading-snug">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
