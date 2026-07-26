/**
 * RealEstateDemo.tsx
 * Real estate rate volatility widget for /real-estate.
 * Queries v_rate_volatility (Supabase view — updated to include lat/lng,
 * bedrooms, avg_rating, review_count and a proper 7-day trailing average).
 *
 * Enhancements vs. original:
 *  - External-link icons on property names in alerts + table (Tier 1 #2)
 *  - Alert threshold label (Tier 2 #8)
 *  - bedrooms / avg_rating / review_count in table (Tier 2 #6)
 *  - "Last checked X ago" freshness indicator (Tier 2 #7)
 *  - Sparklines (last 5 known prices) for unavailable rows (Tier 1 #4)
 *  - Filter by market, platform, bedrooms (Tier 3 #9)
 *  - Per-market avg rate summary (Tier 3 #10)
 *  - Overall health indicator instead of per-row stale exposure (Tier 3 #11)
 */
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ArrowRight, ExternalLink, Star, Bed, Info } from "lucide-react";

interface RateRow {
  id: string;
  property_id: string;
  property_name: string;
  url: string;
  market: string;
  platform: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  avg_rating: number | null;
  review_count: number | null;
  stay_date: string;
  nightly_rate: number | null;
  is_available: boolean;
  currency: string;
  recorded_at: string;
  trailing_avg_rate: number | null;
  pct_above_trailing_avg: number | null;
}

/** Hand-rolled "X ago" without date-fns */
function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Tiny inline SVG sparkline from a list of prices */
function Sparkline({ prices }: { prices: number[] }) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 60, H = 20;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={W} height={H} className="inline-block align-middle opacity-70" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function RealEstateDemo() {
  const [data, setData] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Filters (Tier 3)
  const [filterMarket, setFilterMarket] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterBedrooms, setFilterBedrooms] = useState<string>("all");

  const fetchData = async () => {
    try {
      const { data: rows, error } = await supabase
        .from("v_rate_volatility")
        .select("*")
        .order("stay_date", { ascending: false });

      if (error) {
        console.error("Error fetching rate volatility:", error);
      } else {
        const typed = (rows as unknown as RateRow[]) || [];
        setData(typed);
        if (typed.length > 0 && !selectedPropertyId) {
          const nycProps = typed.filter(
            (r) => r.market && (r.market.toLowerCase().includes("nyc") || r.market.toLowerCase().includes("nj"))
          );
          const targetPool = nycProps.length > 0 ? nycProps : typed;
          const mostVolatile = targetPool.reduce((prev, curr) => {
            const prevVal = Math.abs(prev.pct_above_trailing_avg ?? 0);
            const currVal = Math.abs(curr.pct_above_trailing_avg ?? 0);
            return currVal > prevVal ? curr : prev;
          }, targetPool[0]);
          setSelectedPropertyId(mostVolatile.property_id);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching rate data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    const channel = supabase
      .channel("public:rate_history")
      .on("postgres_changes", { event: "*", schema: "public", table: "rate_history" }, () => {
        void fetchData();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────

  const uniqueProperties = useMemo(() => Array.from(
    new Map(data.map((r) => [r.property_id, {
      id: r.property_id,
      name: r.property_name,
      market: r.market,
      platform: r.platform,
      bedrooms: r.bedrooms,
    }])).values()
  ), [data]);

  // Filter options
  const markets = useMemo(() => Array.from(new Set(uniqueProperties.map(p => p.market).filter(Boolean))).sort(), [uniqueProperties]);
  const platforms = useMemo(() => Array.from(new Set(uniqueProperties.map(p => p.platform).filter(Boolean))).sort(), [uniqueProperties]);
  const bedroomOptions = useMemo(() => Array.from(new Set(uniqueProperties.map(p => p.bedrooms).filter((b): b is number => b !== null))).sort((a,b)=>a-b), [uniqueProperties]);

  // Filtered latest rows per property
  const filteredProperties = useMemo(() => uniqueProperties.filter(p => {
    if (filterMarket !== "all" && p.market !== filterMarket) return false;
    if (filterPlatform !== "all" && p.platform !== filterPlatform) return false;
    if (filterBedrooms !== "all" && String(p.bedrooms) !== filterBedrooms) return false;
    return true;
  }), [uniqueProperties, filterMarket, filterPlatform, filterBedrooms]);

  const latestPerProperty = useMemo(() =>
    filteredProperties.map((p) => data.find((r) => r.property_id === p.id)!).filter(Boolean),
  [filteredProperties, data]);

  // Spike alerts (unfiltered — show all properties)
  const spikes = useMemo(() => Array.from(
    new Map(
      data
        .filter((r) => r.pct_above_trailing_avg !== null && r.pct_above_trailing_avg >= 25)
        .sort((a, b) => (b.pct_above_trailing_avg ?? 0) - (a.pct_above_trailing_avg ?? 0))
        .map((r) => [r.property_id, r])
    ).values()
  ).slice(0, 4), [data]);

  // Chart data for selected property
  const chartData = useMemo(() => data
    .filter((r) => r.property_id === selectedPropertyId)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((r) => {
      const d = new Date(r.recorded_at);
      return {
        ...r,
        dateShort: d.toLocaleDateString(undefined, {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
        }),
        dateOnly: d.toLocaleDateString(undefined, {
          month: "short", day: "numeric"
        }),
        timeOnly: d.toLocaleTimeString(undefined, {
          hour: "numeric", minute: "2-digit"
        }),
      };
    }), [data, selectedPropertyId]);

  // Health indicator (Tier 3 #11)
  const totalProperties = uniqueProperties.length;
  const reportingIn24h = useMemo(() => new Set(
    data.filter(r => (Date.now() - new Date(r.recorded_at).getTime()) < 24 * 3600 * 1000)
        .map(r => r.property_id)
  ).size, [data]);

  // Per-market avg rate summary (Tier 3 #10)
  const marketSummary = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    latestPerProperty.forEach(r => {
      if (!r.market || r.nightly_rate === null) return;
      if (!map[r.market]) map[r.market] = { sum: 0, count: 0 };
      map[r.market].sum += r.nightly_rate;
      map[r.market].count += 1;
    });
    return Object.entries(map).map(([market, { sum, count }]) => ({
      market,
      avg: sum / count,
      count,
    })).sort((a, b) => b.avg - a.avg);
  }, [latestPerProperty]);

  const formatRate = (r: RateRow) =>
    `${r.currency === "USD" ? "$" : r.currency}${r.nightly_rate?.toFixed(0) ?? "N/A"}/night`;

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6 bg-card p-6 text-sm animate-pulse min-h-[400px]">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="h-5 w-36 rounded bg-muted/60" />
            <div className="h-6 w-24 rounded bg-muted/60" />
          </div>
          <div className="h-52 w-full rounded-md bg-muted/40" />
        </div>
        <div className="h-32 w-full rounded-md bg-muted/40" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center bg-card p-8 text-center min-h-[300px]">
        <span className="text-3xl opacity-40 mb-3">🏠</span>
        <p className="text-sm font-medium text-foreground">No rate data yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Waiting for the first scraper run to complete.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 bg-card p-6 text-sm">

      {/* ── Health Indicator (Tier 3 #11) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${reportingIn24h === totalProperties ? "bg-green-500" : "bg-amber-400"}`} />
          <span className="text-xs text-muted-foreground">
            {reportingIn24h} / {totalProperties} properties reporting in last 24h
          </span>
        </div>
      </div>

      {/* ── Spike Alert Panel ── */}
      {spikes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-amber-500" />
            <h4 className="font-semibold text-foreground">Rate Spike Alerts</h4>
            <span className="text-muted-foreground font-normal text-xs">(≥ 25% above 7-day trailing avg)</span>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-1">
            Alerts trigger when a property's current rate deviates ≥ 25% from its own 7-day average, signaling a pricing surge or correction worth investigating.
          </p>
          <div className="flex flex-col gap-2">
            {spikes.map((spike) => (
              <div
                key={spike.property_id}
                className="flex items-start justify-between rounded-md border border-amber-500/30 bg-amber-500/5 p-3 border-l-2 border-l-amber-500"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground text-sm flex items-center gap-1.5">
                    <span className="truncate max-w-[180px] sm:max-w-xs" title={spike.property_name}>{spike.property_name}</span>
                    {spike.url && (
                      <a
                        href={spike.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                        title="View listing"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {spike.market} · {spike.platform}
                    <span className="mx-1 opacity-40">·</span>
                    Stay: {new Date(spike.stay_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="font-bold text-amber-400 text-sm">
                    {spike.currency === "USD" ? "$" : spike.currency}{spike.nightly_rate?.toFixed(0) ?? "N/A"}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">/ night</span>
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/40 text-amber-400 font-mono">
                    +{spike.pct_above_trailing_avg?.toFixed(1)}% vs avg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Rate History Chart ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">Nightly Rate History</h4>
            <span className="text-[10px] text-muted-foreground sm:hidden flex items-center gap-1">
              Swipe <ArrowRight className="size-3" />
            </span>
          </div>
          {uniqueProperties.length > 0 && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[220px] truncate"
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              {uniqueProperties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        {chartData.length > 0 ? (
          <div className="relative w-full border border-border/50 rounded-lg bg-card/50 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden z-10" />
            <div className="w-full overflow-x-auto">
              <div className="h-64 min-w-[600px] w-full p-4 pr-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="dateShort"
                      tick={(props: any) => {
                        const { x, y, index } = props;
                        const dataPoint = chartData[index];
                        if (!dataPoint) return null;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={10} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize={10}>
                              <tspan>{dataPoint.dateOnly}</tspan>
                              <tspan className="hidden sm:inline">, {dataPoint.timeOnly}</tspan>
                            </text>
                          </g>
                        );
                      }}
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(v) => `$${v}`}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "6px" }}
                      itemStyle={{ fontSize: "12px" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={((value: unknown, name: unknown) => [
                        value != null ? `$${Number(value).toFixed(0)}/night` : "N/A",
                        name === "nightly_rate" ? "Nightly Rate" : "7-day Trailing Avg",
                      ]) as any}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length && payload[0].payload) {
                          return payload[0].payload.dateShort;
                        }
                        return label;
                      }}
                      labelStyle={{ color: "var(--color-muted-foreground)", fontSize: "11px" }}
                    />
                <Legend
                  iconType="line"
                  wrapperStyle={{ fontSize: "10px", color: "var(--color-muted-foreground)" }}
                  formatter={(value) => value === "nightly_rate" ? "Nightly Rate" : "7-day Trailing Avg"}
                />
                <Line
                  type="monotone"
                  dataKey="nightly_rate"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "var(--color-card)", strokeWidth: 2, stroke: "var(--color-primary)" }}
                  activeDot={{ r: 4, fill: "var(--color-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="trailing_avg_rate"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full border border-border/50 rounded-lg bg-card/50 p-4 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Select a property to view rate history</p>
          </div>
        )}
      </div>

      {/* ── Per-Market Summary (Tier 3 #10) ── */}
      {marketSummary.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">Market Averages</h4>
            <p className="text-[10px] text-muted-foreground">
              Current mean nightly rate aggregated across all priced listings in each respective region.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {marketSummary.map(({ market, avg, count }) => (
              <div key={market} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/20 text-xs">
                <span className="font-medium text-foreground">{market}</span>
                <span className="text-muted-foreground">avg ${avg.toFixed(0)}/night</span>
                <span className="text-muted-foreground/50">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters (Tier 3 #9) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-foreground">Property Rate Snapshot</h4>
            <span className="text-[10px] text-muted-foreground sm:hidden flex items-center gap-1">
              Swipe <ArrowRight className="size-3" />
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Latest recorded prices and availability against each property's 7-day trailing average benchmark.
            Rates and availability reflect a live 2-night check-in window starting each day, refreshed 4× daily. This is not full-calendar occupancy.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2">
          {markets.length > 1 && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={filterMarket}
              onChange={e => setFilterMarket(e.target.value)}
            >
              <option value="all">All Markets</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {platforms.length > 1 && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
            >
              <option value="all">All Platforms</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {bedroomOptions.length > 1 && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={filterBedrooms}
              onChange={e => setFilterBedrooms(e.target.value)}
            >
              <option value="all">All Bedrooms</option>
              {bedroomOptions.map(b => <option key={b} value={String(b)}>{b} BR</option>)}
            </select>
          )}
          {(filterMarket !== "all" || filterPlatform !== "all" || filterBedrooms !== "all") && (
            <button
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2 py-1"
              onClick={() => { setFilterMarket("all"); setFilterPlatform("all"); setFilterBedrooms("all"); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {latestPerProperty.length > 0 ? (
          <div className="relative w-full rounded-md border border-border shadow-sm overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden z-10" />
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Property</th>
                    <th className="px-4 py-2.5 font-medium">Market</th>
                    <th className="px-4 py-2.5 font-medium">Platform</th>
                    <th className="px-4 py-2.5 font-medium">Beds / Rating</th>
                    <th className="px-4 py-2.5 font-medium">Stay Date</th>
                    <th className="px-4 py-2.5 font-medium">Rate</th>
                    <th className="px-4 py-2.5 font-medium">vs 7d Avg</th>
                    <th className="px-4 py-2.5 font-medium">Avail.</th>
                    <th className="px-4 py-2.5 font-medium">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {latestPerProperty.map((row) => {
                    const pct = row.pct_above_trailing_avg;
                    const pctColor =
                      pct === null ? "text-muted-foreground"
                      : pct >= 25 ? "text-amber-400 font-semibold"
                      : pct > 0 ? "text-green-500"
                      : "text-red-400";

                    const hoursSince = (Date.now() - new Date(row.recorded_at).getTime()) / (1000 * 60 * 60);
                    const isStale = hoursSince > 24;
                    const isPriced = row.nightly_rate !== null;

                    // Last 5 priced readings for sparkline
                    const recentPriced = data
                      .filter(r => r.property_id === row.property_id && r.nightly_rate !== null)
                      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                      .slice(0, 5)
                      .reverse();

                    let rateDisplay: React.ReactNode;
                    if (isPriced) {
                      rateDisplay = formatRate(row);
                    } else {
                      const sparkPrices = recentPriced.map(r => r.nightly_rate!);
                      const lastKnown = recentPriced[recentPriced.length - 1];
                      rateDisplay = (
                        <span className="flex flex-col gap-0.5">
                          <span className={`font-medium flex items-center gap-1 ${isStale ? "text-amber-500/80" : "text-muted-foreground"}`}>
                            {isStale ? "Stale" : "Unavailable"}
                            <span title="Reflects a 2-night stay starting today rather than the property's full calendar. Other dates may still be bookable.">
                              <Info className="size-3 opacity-60 cursor-help" />
                            </span>
                          </span>
                          {lastKnown && (
                            <span className="flex items-center gap-1.5">
                              <Sparkline prices={sparkPrices} />
                              <span className="text-muted-foreground/70 text-[10px]">
                                last ${lastKnown.nightly_rate?.toFixed(0)} · {new Date(lastKnown.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            </span>
                          )}
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={row.property_id}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${row.property_id === selectedPropertyId ? "bg-muted/20" : ""} ${isStale ? "opacity-60" : ""}`}
                        onClick={() => setSelectedPropertyId(row.property_id)}
                      >
                        {/* Property name + external link */}
                        <td className="px-4 py-3 font-medium text-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="max-w-[140px] truncate" title={row.property_name}>{row.property_name}</span>
                            {row.url && (
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                title="View listing"
                              >
                                <ExternalLink className="size-3" />
                              </a>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.market || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.platform || "—"}</td>
                        {/* Bedrooms + Rating (Tier 2 #6) */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="flex flex-col gap-0.5">
                            {row.bedrooms != null && (
                              <span className="flex items-center gap-1">
                                <Bed className="size-3 opacity-60" />
                                {row.bedrooms}
                              </span>
                            )}
                            {row.avg_rating != null && (
                              <span className="flex items-center gap-1">
                                <Star className="size-3 opacity-60" />
                                {row.avg_rating.toFixed(1)}
                                {row.review_count != null && <span className="opacity-60">({row.review_count})</span>}
                              </span>
                            )}
                            {row.bedrooms == null && row.avg_rating == null && "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(row.stay_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{rateDisplay}</td>
                        <td className={`px-4 py-3 ${pctColor}`}>
                          {pct !== null ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[10px] ${row.is_available ? "text-green-500" : "text-muted-foreground"}`}>
                            {row.is_available ? "YES" : "NO"}
                          </span>
                        </td>
                        {/* Last checked (Tier 2 #7) */}
                        <td className="px-4 py-3 text-muted-foreground" title={new Date(row.recorded_at).toLocaleString()}>
                          {timeAgo(row.recorded_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-32 w-full flex-col items-center justify-center rounded-md border border-border bg-card/50">
            <span className="text-xl opacity-40 mb-2">🏠</span>
            <p className="text-sm font-medium text-foreground">
              {latestPerProperty.length === 0 && (filterMarket !== "all" || filterPlatform !== "all" || filterBedrooms !== "all")
                ? "No properties match the current filters."
                : "No property data yet."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
