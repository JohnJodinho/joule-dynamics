/**
 * SolutionCard.tsx
 * Renders one solution from a Solution prop — zero hardcoded copy.
 * Template per blueprint §1.3:
 *   Category → Title → Problem → Description → Demo → ROI row → Tech panel → CTA
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ROIMetricsRow from "./ROIMetricsRow";
import type { Solution } from "@/types/data";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SolutionCardProps {
  solution: Solution;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
  const isExternalLink = solution.ctaLink.startsWith("http");
  const isInternalRoute = solution.ctaLink.startsWith("/");

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

        {/* ── Demo embed / Single CTA (A10 Update) ── */}
        <div className="py-2">
          <Button
            asChild
            size="sm"
            className="w-full sm:w-auto gap-2 font-medium text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {isInternalRoute ? (
              <Link to={solution.ctaLink} id={`cta-${solution.id}`}>
                {solution.ctaLabel}
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
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
            )}
          </Button>
        </div>

        {/* ── ROI metrics row (Limited to 1 metric) ── */}
        <ROIMetricsRow metrics={solution.roiMetrics.slice(0, 1)} />

      </CardContent>
    </Card>
  );
}
