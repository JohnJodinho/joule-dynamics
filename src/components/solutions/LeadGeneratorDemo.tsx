import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight } from "lucide-react";

interface LeadRow {
  id: string;
  target_url: string;
  category: string;
  email: string;
  phone: string;
  company_name: string;
  source_url: string;
  created_at: string;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const displayContact = (item: LeadRow) => {
  if (item.email && !isUUID(item.email)) return item.email;
  if (item.phone) return item.phone;
  return "No contact listed";
};

export default function LeadGeneratorDemo() {
  const [data, setData] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: rows, error } = await supabase
        .from("v_recent_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
      } else {
        setData((rows as unknown as LeadRow[]) || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();

    // Realtime subscription
    const channel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        void fetchData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-4 bg-card p-6 text-sm animate-pulse min-h-[300px]">
        <div className="h-5 w-48 rounded bg-muted/60"></div>
        <div className="h-48 w-full rounded-md bg-muted/40"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center bg-card p-8 text-center min-h-[300px]">
        <span className="text-3xl opacity-40 mb-3">📇</span>
        <p className="text-sm font-medium text-foreground">No leads generated yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Waiting for the prospector to complete its first run.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 bg-card p-6 text-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Qualified Leads Pipeline</h4>
        <span className="text-[10px] text-muted-foreground sm:hidden flex items-center gap-1">Swipe <ArrowRight className="size-3"/></span>
      </div>
      <div className="relative w-full rounded-md border border-border shadow-sm overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden z-10"></div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-border bg-muted/30 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Company</th>
              <th className="px-4 py-2.5 font-medium" colSpan={2}>Contact</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Found On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[150px] truncate" title={item.company_name}>
                  {item.company_name || '—'}
                </td>
                <td className="px-4 py-3 text-foreground" colSpan={2}>
                  {displayContact(item)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.category || '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
