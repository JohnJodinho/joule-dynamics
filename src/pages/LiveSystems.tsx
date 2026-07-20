import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PriceMonitorDemo from "@/components/solutions/PriceMonitorDemo";
import LeadGeneratorDemo from "@/components/solutions/LeadGeneratorDemo";
import ChatDemo from "@/components/solutions/ChatDemo";
import RealEstateDemo from "@/components/solutions/RealEstateDemo";
import ScrapeHealthStrip from "@/components/solutions/ScrapeHealthStrip";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SystemStatusBar } from "@/components/layout/SystemStatusBar";
import LiveSystemsNav from "@/components/layout/LiveSystemsNav";
import CredentialFooter from "@/components/layout/CredentialFooter";
import { Activity, Users, MessageSquare, Building2 } from "lucide-react";

interface KPIData {
  pricing: {
    products_tracked: number;
    price_changes_7d: number;
    last_scrape_status: string | null;
    tracking_since: string | null;
  };
  leads: {
    targets_crawled: number;
    new_leads_7d: number;
    total_leads_all_time: number;
    last_scrape_status: string | null;
  };
  real_estate: {
    properties_tracked: number;
    rate_changes_7d: number;
    spikes_7d: number;
    tracking_since: string | null;
    last_scrape_status: Record<string, string> | null;
  } | null;
}

export default function LiveSystems() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_kpis');
        if (error) {
          console.error("Error fetching KPIs:", error);
        } else if (data) {
          setKpis(data as unknown as KPIData);
        }
      } catch (e) {
        console.error("Unexpected error:", e);
      } finally {
        setLoading(false);
      }
    };
    void fetchKpis();
  }, []);

  const renderSkeletonKpis = (count = 4) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-border bg-card/50 rounded-lg animate-pulse">
          <div className="h-4 w-20 bg-muted/60 mb-2 rounded" />
          <div className="h-6 w-12 bg-muted/40 rounded" />
        </div>
      ))}
    </div>
  );

  const statusColor = (s: string | null) =>
    s === "success" || s === "completed" ? "text-green-500" : "";

  return (
    <>
      <SystemStatusBar />
      <LiveSystemsNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16 pb-20">

        {/* Intro */}
        <div className="max-w-3xl pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Live Systems
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Everything below is running against real (test) businesses. These live widgets demonstrate
            the data ingestion, transformation, and interactive outputs of our systems in real-time.
          </p>
        </div>

        {/* ── 1. Pricing Intelligence ── */}
        <section id="pricing" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-md">
              <Activity className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Pricing Intelligence Engine</h2>
          </div>

          <ErrorBoundary fallbackMessage="Failed to load Pricing KPIs.">
            {loading || !kpis ? renderSkeletonKpis() : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KPICard label="Products Tracked" value={kpis.pricing.products_tracked} />
                <KPICard label="Price Changes (7d)" value={kpis.pricing.price_changes_7d} />
                <KPICard
                  label="Last Scrape Status"
                  value={kpis.pricing.last_scrape_status || 'Pending'}
                  valueClass={statusColor(kpis.pricing.last_scrape_status)}
                />
                <KPICard
                  label="Tracking Since"
                  value={kpis.pricing.tracking_since
                    ? new Date(kpis.pricing.tracking_since).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A'}
                />
              </div>
            )}
          </ErrorBoundary>

          <ErrorBoundary fallbackMessage="Failed to load Pricing Dashboard.">
            <div className="border border-border rounded-lg overflow-hidden bg-card/30">
              <PriceMonitorDemo />
            </div>
          </ErrorBoundary>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* ── 2. Real Estate Rate Monitor ── */}
        <section id="real-estate" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-md">
              <Building2 className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Real Estate Rate Monitor</h2>
          </div>

          <ErrorBoundary fallbackMessage="Failed to load Real Estate KPIs.">
            {loading || !kpis ? renderSkeletonKpis() : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KPICard label="Properties Tracked" value={kpis.real_estate?.properties_tracked ?? '—'} />
                <KPICard label="Rate Changes (7d)" value={kpis.real_estate?.rate_changes_7d ?? '—'} />
                <KPICard label="25%+ Spikes (7d)" value={kpis.real_estate?.spikes_7d ?? '—'} />
                <div className="flex flex-col p-4 bg-card border border-border rounded-lg shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Scrape Status</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {kpis.real_estate?.last_scrape_status ? (
                      Object.entries(kpis.real_estate.last_scrape_status).map(([platform, status]) => (
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

          <ErrorBoundary fallbackMessage="Failed to load Real Estate Dashboard.">
            <div className="border border-border rounded-lg overflow-hidden bg-card/30">
              <RealEstateDemo />
            </div>
          </ErrorBoundary>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* ── 3. Support Assistant ── */}
        <section id="assistant" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 max-w-md pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-md">
                  <MessageSquare className="size-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Customer Support Assistant</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Answering from a 15-document knowledge base with strict zero-hallucination constraints.
                It understands nuanced returns policies, shipping details, and product manuals.
              </p>
            </div>

            <div className="flex-1 w-full flex justify-center">
              <ErrorBoundary fallbackMessage="Failed to load Chat Widget.">
                <div className="w-full max-w-[700px] h-[500px] border border-border rounded-lg overflow-hidden bg-card/50 shadow-sm relative">
                  <ChatDemo />
                </div>
              </ErrorBoundary>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* ── 4. Lead Generation (last) ── */}
        <section id="leads" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-md">
              <Users className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">B2B Lead Prospector</h2>
          </div>

          <ErrorBoundary fallbackMessage="Failed to load Leads KPIs.">
            {loading || !kpis ? renderSkeletonKpis() : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KPICard label="Targets Crawled" value={kpis.leads.targets_crawled} />
                <KPICard label="New Leads (7d)" value={kpis.leads.new_leads_7d} />
                <KPICard label="Total Leads All-Time" value={kpis.leads.total_leads_all_time} />
                <KPICard
                  label="Last Scrape Status"
                  value={kpis.leads.last_scrape_status || 'Pending'}
                  valueClass={statusColor(kpis.leads.last_scrape_status)}
                />
              </div>
            )}
          </ErrorBoundary>

          <ErrorBoundary fallbackMessage="Failed to load Leads Dashboard.">
            <div className="border border-border rounded-lg overflow-hidden bg-card/30">
              <LeadGeneratorDemo />
            </div>
          </ErrorBoundary>
        </section>

      </main>

      {/* Footer Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ScrapeHealthStrip />
      </div>

      <CredentialFooter />
    </>
  );
}

function KPICard({ label, value, valueClass = "" }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="p-4 border border-border bg-card/50 rounded-lg flex flex-col justify-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-xl font-bold text-foreground capitalize ${valueClass}`}>{value}</span>
    </div>
  );
}
