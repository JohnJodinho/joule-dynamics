import { Badge } from "@/components/ui/badge";
import config from "@/data/config.json";
import type { LinkNode } from "@/types/data";

const LINKS = config.links as LinkNode[];

export default function CredentialFooter() {
  return (
    <footer className="border-t border-border bg-card py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* ── Left: Brand Lock ── */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold tracking-widest text-foreground uppercase font-mono">
              Joule Dynamics © 2026
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Built on Industrial Logic.
            </p>
          </div>

          {/* ── Center: Credential Badges ── */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row flex-wrap gap-2 md:items-center md:justify-center">
            <Badge
              variant="default"
              className="rounded-sm font-mono text-[10px] tracking-wider px-2.5 py-1 bg-primary text-primary-foreground"
            >
              [VERIFIED] B.Eng. Mechanical Engineering (First Class)
            </Badge>
            <Badge
              variant="outline"
              className="rounded-sm font-mono text-[10px] tracking-wider px-2.5 py-1 border-border text-muted-foreground"
            >
              [CERTIFIED] Microsoft Azure AI-102
            </Badge>
          </div>

          {/* ── Right: Direct Access Links ── */}
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground transition-colors duration-150 hover:text-accent"
              >
                <span
                  className="inline-block h-1 w-1 rounded-full bg-muted-foreground transition-colors duration-150 group-hover:bg-accent"
                  aria-hidden="true"
                />
                {link.label}
              </a>
            ))}
          </div>

        </div>

        {/* ── Bottom rule ── */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
            SYS // JOULE-DYNAMICS-V1.0.0 · STACK: REACT 19 · VITE · TAILWIND V4 · SHADCN
          </p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
            ALL SYSTEMS NOMINAL
          </p>
        </div>
      </div>
    </footer>
  );
}
