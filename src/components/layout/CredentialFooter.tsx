/**
 * CredentialFooter.tsx
 * Revamp: adds the About blurb + credentials section from config.about
 * above the existing footer links grid.
 */
import { Badge } from "@/components/ui/badge";
import config from "@/data/config.json";
import type { LinkNode, RootConfig } from "@/types/data";

const { links, about } = config as unknown as RootConfig;
const LINKS = links as LinkNode[];

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
    <footer className="border-t border-border bg-card mt-16">

      {/* ── About section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">{about.headline}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              {about.bio}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
              CREDENTIALS
            </p>
            {about.credentials.map((cred) => (
              <Badge
                key={cred}
                variant="outline"
                className="rounded-sm font-mono text-[10px] tracking-wide px-2.5 py-1 border-border text-muted-foreground w-fit"
              >
                {cred}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer links grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

          {/* ── Column 2: Verified Credentials ── */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
              VERIFIED
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

          {/* ── Columns 3–4: Direct Access Links ── */}
          <div className="md:col-span-2 xl:col-span-2 flex flex-col gap-2">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
              DIRECT ACCESS
            </p>
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
            SYS // JOULE-DYNAMICS-V2.0.0 · STACK: REACT 19 · VITE · TAILWIND V4 · SHADCN
          </p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
            🔧 ACTIVE DEVELOPMENT HUB — VERCEL
          </p>
        </div>
      </div>

    </footer>
  );
}
