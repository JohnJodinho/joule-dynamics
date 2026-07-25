/**
 * RealEstatePage.tsx
 * Dedicated page for the Real Estate Rate Monitor at /real-estate.
 * Includes KPI cards (from get_dashboard_kpis RPC), RealEstateDemo widget,
 * PropertyMap (Mapbox), and the Service Tier section.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SystemStatusBar } from "@/components/layout/SystemStatusBar";
import CredentialFooter from "@/components/layout/CredentialFooter";
import RealEstateDemo from "@/components/solutions/RealEstateDemo";
import PropertyMap from "@/components/solutions/PropertyMap";
import ServiceTierSection from "@/components/solutions/ServiceTierSection";
import ScrapeHealthStrip from "@/components/solutions/ScrapeHealthStrip";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Building2 } from "lucide-react";

interface RealEstateKPIs {
  properties_tracked: number;
  rate_changes_7d: number;
  spikes_7d: number;
  tracking_since: string | null;
  last_scrape_status: Record<string, string> | null;
}

export default function RealEstatePage() {
  const [kpis, setKpis] = useState<RealEstateKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const { data, error } = await supabase.rpc("get_dashboard_kpis");
        if (error) {
          console.error("Error fetching KPIs:", error);
        } else if (data) {
          const d = data as Record<string, unknown>;
          setKpis((d.real_estate as RealEstateKPIs) ?? null);
        }
      } catch (e) {
        console.error("Unexpected error fetching KPIs:", e);
      } finally {
        setLoading(false);
      }
    };
    void fetchKpis();
  }, []);

  const statusColor = (s: string | null) =>
    s === "success" || s === "completed" ? "text-green-500" : "";

  const renderSkeleton = (count = 4) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-border bg-card/50 rounded-lg animate-pulse">
          <div className="h-4 w-20 bg-muted/60 mb-2 rounded" />
          <div className="h-6 w-12 bg-muted/40 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <SystemStatusBar />

      {/* Sticky page header */}
      <div className="sticky top-12 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Building2 className="size-4 text-primary" />
          </div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Real Estate Rate Monitor
          </span>
          <a
            href="/live-systems"
            className="ml-auto text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          >
            ← All Live Systems
          </a>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-12">

        {/* Header */}
        <div className="max-w-3xl pt-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Real Estate Rate Monitor
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Live nightly rate intelligence across short-term rental markets.
            Tracks competitor pricing, detects rate spikes, and surfaces booking
            availability in real time — checking each listing up to 4× daily.
          </p>
        </div>

        {/* KPI Cards */}
        <ErrorBoundary fallbackMessage="Failed to load Real Estate KPIs.">
          {loading || !kpis ? renderSkeleton(4) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="Properties Tracked" value={kpis.properties_tracked} />
              <KPICard label="Rate Changes (7d)" value={kpis.rate_changes_7d} />
              <KPICard label="25%+ Spikes (7d)" value={kpis.spikes_7d} />

              {/* Per-platform scrape status */}
              <div className="flex flex-col p-4 bg-card border border-border rounded-lg shadow-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Scrape Status</span>
                <div className="flex flex-col gap-1 mt-1">
                  {kpis.last_scrape_status && Object.keys(kpis.last_scrape_status).length > 0 ? (
                    Object.entries(kpis.last_scrape_status).map(([platform, status]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">{platform}</span>
                        <span className={`text-sm font-semibold ${statusColor(status)}`}>{status}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-2xl font-semibold text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>

        {/* Main Dashboard Widget */}
        <ErrorBoundary fallbackMessage="Failed to load Rate Monitor dashboard.">
          <div className="border border-border rounded-lg overflow-hidden bg-card/30">
            <RealEstateDemo />
          </div>
        </ErrorBoundary>

        {/* Property Map */}
        <ErrorBoundary fallbackMessage="Failed to load property map.">
          <PropertyMap totalProperties={kpis?.properties_tracked} />
        </ErrorBoundary>

        {/* Service Tier Section */}
        <ServiceTierSection />

      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ScrapeHealthStrip />
      </div>

      <CredentialFooter />
    </>
  );
}

function KPICard({ label, value, valueClass = "" }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="p-4 border border-border bg-card/50 rounded-lg flex flex-col justify-center shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-xl font-bold text-foreground capitalize ${valueClass}`}>{value}</span>
    </div>
  );
}
