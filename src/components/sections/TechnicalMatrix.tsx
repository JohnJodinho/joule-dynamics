import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { services } = config as RootConfig;

export default function TechnicalMatrix() {
  return (
    <section className="py-16 border-b border-border">
      {/* Section identifier */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-primary tracking-widest">
          // 01. CORE CAPABILITIES
        </span>
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* 3-column service grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className="group flex flex-col gap-0 rounded-sm py-0 border-border bg-card hover:border-primary transition-colors duration-200"
          >
            {/* ── Header ── */}
            <CardHeader className="px-5 pt-5 pb-3 gap-1">
              {/* Index glyph */}
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-1 uppercase">
                SVC_{service.id.toUpperCase()}
              </p>
              <CardTitle className="text-sm font-bold tracking-wide text-foreground uppercase">
                {service.title}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                {service.description}
              </CardDescription>
            </CardHeader>

            {/* ── Stack badges ── */}
            <CardContent className="px-5 pb-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-1.5">
                {service.stack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs bg-secondary text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* ── ROI Vector meter ── */}
              <div className="pt-4 border-t border-border">
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">
                  ROI VECTOR
                </p>
                <p
                  className="font-mono text-xs font-bold tracking-wider uppercase leading-snug"
                  style={{ color: "var(--color-accent)" }}
                >
                  ▸ {service.roiVector}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
