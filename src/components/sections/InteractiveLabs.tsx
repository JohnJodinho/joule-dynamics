import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Terminal } from "lucide-react";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { labs } = config as RootConfig;

export default function InteractiveLabs() {
  return (
    <section className="py-16 border-b border-border">
      {/* ── Section identifier ── */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-primary tracking-widest">
          // 02. INTERACTIVE LABS &amp; TELEMETRY
        </span>
        <span
          aria-hidden="true"
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* ── Tabs shell ── */}
      <Tabs className="w-full mt-6" defaultValue={labs[0].id}>

        {/* Tab list — horizontally scrollable on mobile, underline variant */}
        <div className="overflow-x-auto">
          <TabsList
            variant="line"
            className="w-max min-w-full justify-start rounded-none border-b border-border bg-transparent pb-0 gap-0"
          >
            {labs.map((lab) => (
              <TabsTrigger
                key={lab.id}
                value={lab.id}
                className="rounded-none px-5 py-2.5 text-xs font-mono tracking-widest uppercase whitespace-nowrap
                           data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary
                           hover:text-foreground transition-colors"
              >
                {lab.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Tab content panels ── */}
        {labs.map((lab) => (
          <TabsContent key={lab.id} value={lab.id} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* ────── LEFT PANE: Execution Specs ────── */}
              <div className="flex flex-col">
                {/* Category */}
                <p
                  className="font-mono text-sm tracking-widest uppercase"
                  style={{ color: "var(--color-accent)" }}
                >
                  {lab.category}
                </p>

                {/* Title */}
                <h3 className="text-2xl font-bold mt-2 text-foreground">
                  {lab.title}
                </h3>

                {/* Architecture badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {lab.architecture.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="font-mono text-xs rounded-sm"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Divider */}
                <div
                  className="mt-6 mb-0 h-px"
                  style={{ backgroundColor: "var(--color-border)" }}
                />

                {/* Descriptor row */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      STATUS
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>
                      <span className="font-mono text-xs text-green-400">LIVE</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      ENDPOINT
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
                      {lab.liveUrl.replace("https://", "")}
                    </p>
                  </div>
                </div>

                {/* CTA button */}
                <Button
                  size="lg"
                  className="mt-8 w-full sm:w-auto gap-2 font-mono text-xs tracking-widest uppercase"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "hsl(199 89% 42%)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-primary)")
                  }
                  onClick={() => window.open(lab.liveUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="size-3.5" />
                  Initialize Secure Connection // Live Demo
                </Button>
              </div>

              {/* ────── RIGHT PANE: Simulated Terminal ────── */}
              <div className="rounded-md bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl flex flex-col">

                {/* Terminal title bar */}
                <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-2">
                  {/* macOS-style window controls */}
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />

                  {/* Fake path */}
                  <div className="ml-3 flex items-center gap-1.5 text-zinc-500">
                    <Terminal className="size-3" />
                    <span className="font-mono text-[10px] tracking-wide">
                      joule-dynamics ~ api/v1/{lab.id}/stream
                    </span>
                  </div>
                </div>

                {/* Prompt line */}
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-green-400">$</span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    curl -X POST /api/v1/{lab.id}/analyze --stream
                  </span>
                </div>

                {/* Payload output */}
                <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed flex-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  <code>{lab.terminalPayload}</code>
                </pre>

                {/* Status bar */}
                <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between bg-zinc-900/50">
                  <span className="font-mono text-[10px] text-green-400">
                    ✓ 200 OK
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {lab.architecture.join(" · ")}
                  </span>
                </div>
              </div>

            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
