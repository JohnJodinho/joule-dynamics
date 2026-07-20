/**
 * SolutionsShowcase.tsx
 * Top-level section that hosts <SolutionsGrid />.
 * Replaces the old skill/history-first framing with problem-first solution cards.
 */
import SolutionsGrid from "@/components/solutions/SolutionsGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { socialProof } = config as unknown as RootConfig;

export default function SolutionsShowcase() {
  return (
    <section id="solutions" className="py-16 border-b border-border">
      {/* ── Section identifier ── */}
      <div className="flex items-center gap-3 mb-10">
        <SectionHeader sectionId="solutions" />
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* ── Intro copy ── */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug max-w-2xl">
          Four things quietly costing you money — with systems that fix them on autopilot.
        </h2>
        <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
          Each solution is a working system, not a proposal. Pick the one that maps to your biggest current bottleneck.
        </p>
      </div>

      {/* ── Social Proof ── */}
      {socialProof.testimonials && socialProof.testimonials.length > 0 ? (
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialProof.testimonials.slice(0, socialProof.maxTestimonialsToShow).map((t, idx) => (
            <div key={idx} className="border border-border bg-muted/20 p-5 rounded-md flex flex-col justify-between">
              <p className="text-muted-foreground italic text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">{t.role}{t.company ? `, ${t.company}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-12 max-w-3xl border-l-2 border-primary/50 pl-4 py-1">
          <p className="text-muted-foreground italic text-sm md:text-base leading-relaxed">
            "{socialProof.founderNote.quote}"
          </p>
          <p className="mt-2 text-xs font-mono font-bold tracking-widest text-foreground uppercase">
            — {socialProof.founderNote.author}, {socialProof.founderNote.role}
          </p>
        </div>
      )}

      {/* ── Cards ── */}
      <SolutionsGrid />
    </section>
  );
}
