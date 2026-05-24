import { Badge } from "@/components/ui/badge";
import config from "@/data/config.json";
import type { LinkNode } from "@/types/data";

const LINKS = config.links as LinkNode[];

/** Internal hrefs (starting with /) use a plain <a>, external get target="_blank" */
function LinkItem({ link }: { link: LinkNode }) {
  const isInternal = link.href.startsWith("/");
  return (
    <a
      key={link.id}
      href={link.href}
      {...(!isInternal && { target: "_blank", rel: "noopener noreferrer" })}
      className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground transition-colors duration-150 hover:text-accent"
    >
      <span
        className="inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground transition-colors duration-150 group-hover:bg-accent"
        aria-hidden="true"
      />
      {link.label}
    </a>
  );
}

export default function CredentialFooter() {
  return (
    <footer className="border-t border-border bg-card py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/*
         * Layout strategy:
         *   mobile  (< md)  → 1 column, all sections stacked
         *   tablet  (md–xl) → 2 columns: Brand | Badges on row 1,
         *                                Links spans full width on row 2
         *   desktop (≥ xl)  → 4 columns side-by-side, each section isolated
         *
         * This prevents Badges and Links ever sharing a column at any width.
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">

          {/* ── Column 1: Brand Lock ── */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold tracking-widest text-foreground uppercase font-mono">
              Joule Dynamics © 2026
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Built on Industrial Logic.
            </p>
          </div>

          {/* ── Column 2: Credential Badges ── */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
              CREDENTIALS
            </p>
            <Badge
              variant="default"
              className="rounded-sm font-mono text-[10px] tracking-wider px-2.5 py-1 bg-primary text-primary-foreground w-fit"
            >
              [VERIFIED] B.Eng. Mechanical Engineering (First Class)
            </Badge>
            <Badge
              variant="outline"
              className="rounded-sm font-mono text-[10px] tracking-wider px-2.5 py-1 border-border text-muted-foreground w-fit"
            >
              [CERTIFIED] Microsoft Azure AI-102
            </Badge>
          </div>

          {/* ── Columns 3–4: Direct Access Links
               On md (2-col grid) this spans both columns so links wrap freely
               without competing with the badge column above.
               On xl (4-col grid) it occupies cols 3–4 as a single wide lane. ── */}
          <div className="md:col-span-2 xl:col-span-2 flex flex-col gap-2">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
              DIRECT ACCESS
            </p>
            {/* flex-wrap: grows to accommodate any number of links from config.json */}
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {LINKS.map((link) => (
                <LinkItem key={link.id} link={link} />
              ))}
            </div>
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
