/**
 * ROIMetricsRow.tsx
 * Renders ROI metric pills from roiMetrics[].
 * isBenchmark=true → amber "Industry Benchmark" styling (honest labeling per blueprint §1.3).
 * isBenchmark=false → primary color "Verified Result" styling.
 */
import { Badge } from "@/components/ui/badge";
import type { ROIMetric } from "@/types/data";

interface ROIMetricsRowProps {
  metrics: ROIMetric[];
}

export default function ROIMetricsRow({ metrics }: ROIMetricsRowProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="flex flex-col items-start rounded-lg border p-3 gap-1 min-w-[140px]"
          style={{
            borderColor: m.isBenchmark
              ? "hsl(38 95% 60% / 0.35)"
              : "hsl(199 89% 48% / 0.35)",
            backgroundColor: m.isBenchmark
              ? "hsl(38 95% 60% / 0.06)"
              : "hsl(199 89% 48% / 0.06)",
          }}
        >
          {/* Main value */}
          <span
            className="text-xl font-black tracking-tight"
            style={{
              color: m.isBenchmark ? "hsl(38 95% 55%)" : "var(--color-primary)",
            }}
          >
            {m.value}
          </span>

          {/* Label + context */}
          <span className="text-xs text-muted-foreground leading-snug">
            {m.label}
            {m.context && (
              <span className="opacity-70"> {m.context}</span>
            )}
          </span>

          {/* Benchmark badge */}
          <Badge
            variant="outline"
            className="mt-1 text-[9px] px-1.5 py-0.5 rounded-sm font-medium tracking-wide"
            style={{
              borderColor: m.isBenchmark
                ? "hsl(38 95% 60% / 0.5)"
                : "hsl(199 89% 48% / 0.5)",
              color: m.isBenchmark ? "hsl(38 95% 55%)" : "var(--color-primary)",
            }}
          >
            {m.isBenchmark ? "Industry Benchmark" : "Verified Result"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
