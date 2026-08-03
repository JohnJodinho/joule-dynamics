/**
 * ServiceTierSection.tsx
 * "Available Now / On Request" service tier display.
 * Stateless component — copy is verbatim from the brief.
 * Two visually distinct blocks:
 *   - "Available Now": solid/accent card — live, working feature
 *   - "Custom builds": outlined/muted card — not yet available
 */
import { ExternalLink, MessageCircle, Mail } from "lucide-react";
import ContactModal from "@/components/ui/ContactModal";

export default function ServiceTierSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-foreground">What's available</h4>
        <p className="text-xs text-muted-foreground">
          The system you're looking at is live and running. Additional capabilities are available on request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Available Now (solid accent card) ── */}
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-5 flex flex-col gap-4 ring-1 ring-primary/20">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              Available Now
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-foreground">Competitor Rate Watch</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You will know exactly how your competitors price and when
              they move rates, empowering you to respond instead of reacting.
            </p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity self-start"
          >
            View dashboard data ↑
          </button>
        </div>

        {/* ── Custom Builds (outlined muted card) ── */}
        <div className="rounded-lg border border-border bg-card/40 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-medium">
              Custom builds, on request
            </span>
          </div>

          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Owner Acquisition Reports</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Revenue potential analysis to help you win new property management contracts.
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Investor Yield Data</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Occupancy and rate trend analysis to support real estate deals with investors.
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Cross-market arbitrage targeting</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Identifying long-term rentals with strong short-term rental upside.
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Comparable Market Analysis (CMA) Automation</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Automated comps pulled from tracked listings to support pricing and valuation decisions.
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Off-Market Deal Sourcing</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                Flagging listings with distress signals (repeated price drops, extended time-on-market) for investors seeking deals.
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Portfolio Performance Dashboards</span>
              <span className="text-muted-foreground text-xs leading-relaxed">
                A consolidated view across a property manager's full portfolio instead of one listing at a time.
              </span>
            </li>
          </ul>

          <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
            Built to your market and use case. Reach out to discuss what's possible.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://wa.me/2348101344101?text=Hi%20John%2C%20I%27d%20like%20to%20discuss%20a%20custom%20build%20for%20Real%20Estate%20Intelligence."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <MessageCircle className="size-3" />
              Chat on WhatsApp
              <ExternalLink className="size-2.5 opacity-60" />
            </a>

            <ContactModal
              trigger={(open) => (
                <button
                  onClick={open}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Mail className="size-3" />
                  Email Us
                </button>
              )}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
