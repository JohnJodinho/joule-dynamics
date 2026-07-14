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
  ResponsiveContainer,
} from "recharts";
import { Bell, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface PriceRow {
  id: string;
  product_id: string;
  product_name: string;
  url: string;
  price: number;
  currency: string;
  created_at: string;
  tier_used: string;
  previous_price: number | null;
  pct_change: number | null;
}

interface AlertRow {
  id: string;
  alert_type: string;
  product_name: string;
  url: string;
  price_at_alert: number;
  target_price: number | null;
  previous_price: number | null;
  pct_change: number | null;
  created_at: string;
  acknowledged: boolean;
}

export default function PriceMonitorDemo() {
  const [data, setData] = useState<PriceRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data: rows, error } = await supabase
        .from("v_recent_prices")
        .select("*")
        .not("product_id", "is", null)
        .not("product_name", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prices:", error);
      } else {
        const typedRows = (rows as unknown as PriceRow[]) || [];
        setData(typedRows);
        if (typedRows.length > 0 && !selectedProductId) {
          // Group by product_id to find unique products
          const uniqueProducts = Array.from(new Set(typedRows.map(r => r.product_id)));
          if (uniqueProducts.length > 0) {
            setSelectedProductId(uniqueProducts[0]);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching prices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: rows, error } = await supabase
        .from("v_recent_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setAlerts((rows as unknown as AlertRow[]) || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    void fetchData();
    void fetchAlerts();

    // Realtime subscriptions
    const priceChannel = supabase
      .channel('public:price_history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_history' }, () => {
        void fetchData();
      })
      .subscribe();

    const alertsChannel = supabase
      .channel('public:price_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_alerts' }, () => {
        void fetchAlerts();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(priceChannel);
      void supabase.removeChannel(alertsChannel);
    };
  }, []);

  if (loading || loadingAlerts) {
    return (
      <div className="flex h-full w-full flex-col gap-6 bg-card p-4 text-sm animate-pulse">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
             <div className="h-5 w-32 rounded bg-muted/60"></div>
             <div className="h-6 w-24 rounded bg-muted/60"></div>
          </div>
          <div className="h-48 w-full rounded-md bg-muted/40"></div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-5 w-48 rounded bg-muted/60"></div>
          <div className="h-32 w-full rounded-md bg-muted/40"></div>
        </div>
      </div>
    );
  }

  // Color helper
  const getPctChangeColor = (pct: number | null) => {
    if (pct === null || pct === 0) return "text-muted-foreground";
    return pct < 0 ? "text-red-500" : "text-green-500";
  };
  
  const formatPct = (pct: number | null) => {
    if (pct === null) return "0.0%";
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
  };

  // Derived state
  const uniqueProducts = Array.from(
    new Map(data.map((item) => [item.product_id, { id: item.product_id, name: item.product_name }])).values()
  );

  // For the table, we only want the LATEST entry per product
  const latestPrices = uniqueProducts.map(p => {
    return data.find(d => d.product_id === p.id)!;
  });

  // For the chart, we want all history for the selected product, sorted chronological
  const chartData = data
    .filter((d) => d.product_id === selectedProductId)
    .map((d) => ({
      ...d,
      dateShort: new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }))
    .reverse(); // Reverse so older dates are first on x-axis

  return (
    <div className="flex h-full w-full flex-col gap-8 bg-card p-4 text-sm">
      
      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h4 className="font-semibold text-foreground">Actionable Alerts</h4>
          </div>
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-start justify-between rounded-md border border-border p-3 transition-opacity ${alert.acknowledged ? 'opacity-60 bg-muted/20' : 'bg-background shadow-sm border-l-2 border-l-primary'}`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground text-sm truncate max-w-[200px] sm:max-w-xs">{alert.product_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {alert.alert_type === 'target_reached' 
                      ? `Hit target of $${alert.target_price?.toFixed(2)}` 
                      : `Changed from $${alert.previous_price?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`flex items-center gap-1 font-bold ${getPctChangeColor(alert.pct_change)}`}>
                    {alert.pct_change && alert.pct_change < 0 ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                    ${alert.price_at_alert.toFixed(2)} ({formatPct(alert.pct_change)})
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Price History</h4>
          {uniqueProducts.length > 0 && (
            <select 
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px] truncate"
              value={selectedProductId || ""}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {uniqueProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-48 w-full border border-border/50 rounded-lg bg-card/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="dateShort" 
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} 
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(val) => `$${val}`}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "6px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "var(--color-foreground)", fontSize: "12px", fontWeight: 500 }}
                  formatter={(value: any) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value);
                    return [`$${numValue.toFixed(2)}`, "Price"];
                  }}
                  labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px", fontSize: "11px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: "var(--color-card)", strokeWidth: 2, stroke: "var(--color-primary)" }}
                  activeDot={{ r: 5, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 w-full border border-border/50 rounded-lg bg-card/50 p-2 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No chart data</p>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-foreground">Latest Competitor Pricing</h4>
        {latestPrices.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-md border border-border shadow-sm">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Change</th>
                  <th className="px-4 py-2.5 font-medium">Last Checked</th>
                  <th className="px-4 py-2.5 font-medium text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {latestPrices.map(item => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${item.product_id === selectedProductId ? 'bg-muted/20' : ''}`}
                    onClick={() => setSelectedProductId(item.product_id)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate" title={item.product_name}>
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {item.currency === "USD" ? "$" : item.currency}{item.price.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${getPctChangeColor(item.pct_change)}`}>
                      {formatPct(item.pct_change)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      <span className="mx-1 opacity-50">·</span>
                      {new Date(item.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground/70 border-border/60 uppercase tracking-wider bg-transparent">
                        {item.tier_used || 'std'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-32 w-full flex-col items-center justify-center rounded-md border border-border bg-card/50 text-center">
            <span className="text-xl opacity-40 mb-2">📉</span>
            <p className="text-sm font-medium text-foreground">No price data yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
