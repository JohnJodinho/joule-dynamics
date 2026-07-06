/**
 * SolutionsShowcase.tsx
 * Top-level section that hosts <SolutionsGrid />.
 * Replaces the old skill/history-first framing with problem-first solution cards.
 */
import SolutionsGrid from "@/components/solutions/SolutionsGrid";

export default function SolutionsShowcase() {
  return (
    <section id="solutions" className="py-16 border-b border-border">
      {/* ── Section identifier ── */}
      <div className="flex items-center gap-3 mb-10">
        <span className="font-mono text-xs text-primary tracking-widest whitespace-nowrap">
          // 01. SOLUTIONS
        </span>
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* ── Intro copy ── */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug max-w-2xl">
          Three problems we solve — with systems that run themselves.
        </h2>
        <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
          Each solution is a working system, not a proposal. Pick the one that maps to your biggest current bottleneck.
        </p>
      </div>

      {/* ── Cards ── */}
      <SolutionsGrid />
    </section>
  );
}
