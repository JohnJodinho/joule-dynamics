/**
 * SystemStatusBar.tsx
 * Repurposed (revamp): adds the Dev Hub badge + tooltip from config.devHub,
 * alongside the existing telemetry readouts. The badge turns the Vercel subdomain
 * from a potential credibility gap into a transparency signal.
 */
import { useState } from "react";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const { telemetry, devHub } = config as unknown as RootConfig;

export function SystemStatusBar() {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-10 flex items-center justify-between gap-4">

        {/* Left: Brand slug */}
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase shrink-0">
          JOULE//DYNAMICS
        </span>

        {/* Center / Right: Dev Hub badge + telemetry + theme toggle */}
        <div className="flex items-center gap-3 ml-auto">

          {/* ── Dev Hub Badge ── */}
          <div className="relative hidden sm:flex">
            <button
              type="button"
              className="
                flex items-center gap-1.5 rounded-sm border border-amber-500/30
                bg-amber-500/8 px-2.5 py-1 font-mono text-[10px] tracking-wide
                text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/15
                transition-all duration-150 cursor-help
              "
              aria-label={devHub.tooltip}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              onFocus={() => setTooltipVisible(true)}
              onBlur={() => setTooltipVisible(false)}
            >
              {devHub.badgeLabel}
            </button>

            {/* Tooltip */}
            {tooltipVisible && (
              <div
                role="tooltip"
                className="
                  absolute top-full left-0 mt-2 z-50 w-72 rounded-md border border-border
                  bg-popover p-3 text-xs text-muted-foreground leading-relaxed shadow-lg
                "
              >
                {devHub.tooltip}
              </div>
            )}
          </div>

          {/* ── Telemetry readouts (hidden on very small screens) ── */}
          <div className="hidden md:flex items-center gap-4">
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
