import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const { telemetry } = config as RootConfig;

export function SystemStatusBar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-10 flex items-center justify-between">
        {/* Left: Brand slug */}
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          JOULE//DYNAMICS
        </span>

        {/* Right: Telemetry readouts + theme toggle */}
        <div className="flex items-center gap-4">
          {/* Telemetry — hidden on very small screens to preserve toggle */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">UPTIME</span>
              <span className="font-mono text-[10px] text-primary font-bold">{telemetry.uptime}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">LATENCY</span>
              <span className="font-mono text-[10px] text-primary font-bold">{telemetry.latencyMs}ms</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="font-mono text-[10px] font-bold text-green-400 tracking-widest">
                {telemetry.status}
              </span>
            </div>
          </div>

          {/* Theme toggle — always visible */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
