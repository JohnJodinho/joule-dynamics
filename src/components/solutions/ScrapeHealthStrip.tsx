import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface RunRow {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  items_attempted: number;
  items_succeeded: number;
  items_failed: number;
  error_summary: string | null;
}

export default function ScrapeHealthStrip() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("v_recent_runs")
        .select("*")
        .order("started_at", { ascending: false });

      if (!error && data) {
        setRuns(data as unknown as RunRow[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();

    const channel = supabase
      .channel('public:scrape_runs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scrape_runs' }, () => {
        void fetchData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-4 px-4 bg-card/60 border border-border rounded-lg mb-6 animate-pulse">
        <div className="h-4 w-64 bg-muted/60 rounded"></div>
      </div>
    );
  }

  if (runs.length === 0) return null;

  // We want the most recent run for each job_type
  const latestPriceMonitor = runs.find(r => r.job_type === "price_monitor");
  const latestLeadGen = runs.find(r => r.job_type === "lead_gen");

  if (!latestPriceMonitor && !latestLeadGen) return null;

  const renderStatusItem = (label: string, run?: RunRow) => {
    if (!run) return null;
    
    const isSuccess = run.status === "completed" || run.status === "success";
    const isRunning = run.status === "running" || run.status === "in_progress";
    const isError = run.status === "failed" || run.status === "error";

    const Icon = isSuccess ? CheckCircle2 : (isError ? XCircle : (isRunning ? Activity : AlertCircle));
    const iconColor = isSuccess ? "text-green-500" : (isError ? "text-red-500" : "text-amber-500");

    const ratio = run.items_attempted > 0 
      ? Math.round((run.items_succeeded / run.items_attempted) * 100) 
      : 0;

    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground tracking-tight">{label}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {new Date(run.started_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border/50 bg-background/50 ${iconColor}`}>
          <Icon className={`size-3.5 ${isRunning ? 'animate-pulse' : ''}`} />
          <span className="font-mono text-[11px] font-medium text-foreground">
            {run.items_succeeded}/{run.items_attempted} 
            <span className="text-muted-foreground ml-1">({ratio}%)</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between py-3 px-5 bg-card/60 backdrop-blur-sm border border-border rounded-lg shadow-sm mb-6 gap-4 sm:gap-0 transition-all">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 shrink-0">
        <Activity className="size-4 text-primary" />
        Scraper Systems Health
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {renderStatusItem("Pricing Engine", latestPriceMonitor)}
        {latestPriceMonitor && latestLeadGen && (
          <div className="hidden sm:block w-px h-8 bg-border"></div>
        )}
        {renderStatusItem("Lead Prospector", latestLeadGen)}
      </div>
    </div>
  );
}
