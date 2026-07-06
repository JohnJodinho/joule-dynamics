/**
 * SolutionCard.tsx
 * Renders one solution from a Solution prop — zero hardcoded copy.
 * Template per blueprint §1.3:
 *   Category → Title → Problem → Description → Demo → ROI row → Tech panel → CTA
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DemoEmbed from "./DemoEmbed";
import ROIMetricsRow from "./ROIMetricsRow";
import TechStackPanel from "./TechStackPanel";
import type { Solution } from "@/types/data";
import { ArrowRight } from "lucide-react";

interface SolutionCardProps {
  solution: Solution;
  /** Optional interactive widget to slot into DemoEmbed when kind="interactive" */
  interactiveSlot?: React.ReactNode;
}

export default function SolutionCard({ solution, interactiveSlot }: SolutionCardProps) {
  const isExternalLink = solution.ctaLink.startsWith("http");

  return (
    <Card
      id={solution.id}
      className="flex flex-col rounded-lg border border-border bg-card hover:border-primary/50 transition-colors duration-300 overflow-hidden"
    >
      <CardContent className="flex flex-col gap-5 p-6 flex-1">
        {/* ── Category tag ── */}
        <Badge
          variant="outline"
          className="w-fit rounded-sm font-mono text-[10px] tracking-widest uppercase text-muted-foreground border-border"
        >
          {solution.category}
        </Badge>

        {/* ── Title ── */}
        <h3 className="text-xl font-bold leading-snug text-foreground">
          {solution.title}
        </h3>

        {/* ── Problem statement ── */}
        <p className="text-sm text-muted-foreground leading-relaxed -mt-2">
          {solution.problemStatement}
        </p>

        {/* ── Solution description ── */}
        <p className="text-sm leading-relaxed text-foreground/80">
          {solution.solutionDescription}
        </p>

        {/* ── Demo embed ── */}
        <DemoEmbed demo={solution.demo} interactiveSlot={interactiveSlot} />

        {/* ── ROI metrics row ── */}
        <ROIMetricsRow metrics={solution.roiMetrics} />

        {/* ── Under the hood ── */}
        <TechStackPanel tags={solution.techStackTags} />

        {/* ── CTA button — pushed to bottom ── */}
        <div className="mt-auto pt-2">
          <Button
            asChild
            size="sm"
            className="w-full sm:w-auto gap-2 font-medium text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            <a
              href={solution.ctaLink}
              {...(isExternalLink
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              id={`cta-${solution.id}`}
            >
              {solution.ctaLabel}
              <ArrowRight className="size-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
