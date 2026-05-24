import data from "@/data/config.json";
import type { OperationalDeployment } from "@/types/data";
import { Badge } from "@/components/ui/badge";

const deployments = data.deployments as OperationalDeployment[];

export default function OperationalHistory() {
  return (
    <section className="py-16 border-b border-border">
      {/* ── Section identifier ── */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="font-mono text-xs text-primary tracking-widest whitespace-nowrap">
          // 03. OPERATIONAL_HISTORY
        </h2>
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* ── Deployment grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="p-6 bg-card border border-border flex flex-col justify-between hover:border-primary transition-colors duration-200"
          >
            <div>
              {/* Role + Timeline badge */}
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {deployment.role}
                </h3>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-muted-foreground border-border rounded-sm shrink-0"
                >
                  {deployment.timeline}
                </Badge>
              </div>

              {/* Organization */}
              <p
                className="font-mono text-sm mb-5 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                {deployment.organization}
              </p>

              {/* Metric bullets */}
              <ul className="space-y-3">
                {deployment.metrics.map((metric, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start leading-relaxed"
                  >
                    <span className="text-primary mr-3 mt-0.5 font-bold shrink-0">
                      ›
                    </span>
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
