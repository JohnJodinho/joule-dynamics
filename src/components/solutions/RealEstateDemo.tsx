/**
 * RealEstateDemo.tsx
 * Live real estate rate volatility widget for /live-systems#real-estate.
 * Queries v_rate_volatility (Supabase view).
 *
 * Layout:
 *  - Alert panel: listings where pct_above_trailing_avg >= 25%
 *  - Line chart: nightly_rate over stay_date for selected property
 *    (second series: dashed trailing_avg_rate reference line)
 *  - Comparison table: one row per property, latest rate snapshot
 */
import { useState, useEffect } from "react";
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
import { TrendingUp, ArrowRight } from "lucide-react";

interface RateRow {
  id: string;
  property_id: string;
  property_name: string;
  url: string;
  market: string;
  platform: string;
  stay_date: string;
  nightly_rate: number;
  is_available: boolean;
  currency: string;
  recorded_at: string;
  trailing_avg_rate: number | null;
  pct_above_trailing_avg: number | null;
}

export default function RealEstateDemo() {
  const [data, setData] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

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
          // Default to first NYC/NJ property if available, else first row
          const nycProp = typed.find(
            (r) => r.market && (r.market.toLowerCase().includes("nyc") || r.market.toLowerCase().includes("nj"))
          );
          setSelectedPropertyId(nycProp?.property_id ?? typed[0].property_id);
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
  }, []);

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

  // ── Derived state ──────────────────────────────────────────────────────────

  // Unique properties for selector + table
  const uniqueProperties = Array.from(
    new Map(data.map((r) => [r.property_id, { id: r.property_id, name: r.property_name, market: r.market, platform: r.platform }])).values()
  );

  // Latest snapshot per property for the comparison table
  const latestPerProperty = uniqueProperties.map((p) => data.find((r) => r.property_id === p.id)!).filter(Boolean);

  // Spike alerts: pct_above_trailing_avg >= 25, deduplicated by property
  const spikes = Array.from(
    new Map(
      data
        .filter((r) => r.pct_above_trailing_avg !== null && r.pct_above_trailing_avg >= 25)
        .sort((a, b) => (b.pct_above_trailing_avg ?? 0) - (a.pct_above_trailing_avg ?? 0))
        .map((r) => [r.property_id, r])
    ).values()
  ).slice(0, 4);

  // Chart data: nightly_rate over stay_date for selected property (chronological)
  const chartData = data
    .filter((r) => r.property_id === selectedPropertyId)
    .map((r) => ({
      ...r,
      dateShort: new Date(r.stay_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))
    .reverse(); // stay_date ascending


  const formatRate = (r: RateRow) =>
    `${r.currency === "USD" ? "$" : r.currency}${r.nightly_rate?.toFixed(0) ?? "N/A"}/night`;

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

      {/* ── Spike Alert Panel ── */}
      {spikes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-amber-500" />
            <h4 className="font-semibold text-foreground">Rate Spike Alerts <span className="text-muted-foreground font-normal text-xs">(≥ 25% above trailing avg)</span></h4>
          </div>
          <div className="flex flex-col gap-2">
            {spikes.map((spike) => (
              <div
                key={spike.property_id}
                className="flex items-start justify-between rounded-md border border-amber-500/30 bg-amber-500/5 p-3 border-l-2 border-l-amber-500"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground text-sm truncate max-w-[200px] sm:max-w-xs" title={spike.property_name}>
                    {spike.property_name}
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
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Nightly Rate History</h4>
          {uniqueProperties.length > 0 && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[180px] truncate"
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
          <div className="h-64 w-full border border-border/50 rounded-lg bg-card/50 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="dateShort"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
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
                    name === "nightly_rate" ? "Nightly Rate" : "7-day Avg",
                  ]) as any}
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
        ) : (
          <div className="h-64 w-full border border-border/50 rounded-lg bg-card/50 p-4 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Select a property to view rate history</p>
          </div>
        )}
      </div>

      {/* ── Comparison Table ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Property Rate Snapshot</h4>
          {latestPerProperty.length > 0 && (
            <span className="text-[10px] text-muted-foreground sm:hidden flex items-center gap-1">
              Swipe <ArrowRight className="size-3" />
            </span>
          )}
        </div>
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
                    <th className="px-4 py-2.5 font-medium">Rate</th>
                    <th className="px-4 py-2.5 font-medium">vs 7d Avg</th>
                    <th className="px-4 py-2.5 font-medium">Available</th>
                    <th className="px-4 py-2.5 font-medium">Recorded</th>
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
                    return (
                      <tr
                        key={row.property_id}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${row.property_id === selectedPropertyId ? "bg-muted/20" : ""}`}
                        onClick={() => setSelectedPropertyId(row.property_id)}
                      >
                        <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate" title={row.property_name}>
                          {row.property_name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.market || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.platform || "—"}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{formatRate(row)}</td>
                        <td className={`px-4 py-3 ${pctColor}`}>
                          {pct !== null ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[10px] ${row.is_available ? "text-green-500" : "text-muted-foreground"}`}>
                            {row.is_available ? "YES" : "NO"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(row.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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
            <p className="text-sm font-medium text-foreground">No property data yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
