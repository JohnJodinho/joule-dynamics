import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Linkedin, Twitter, Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeadRow {
  id: string;
  target_url: string;
  category: string;
  email?: string;
  phone?: string;
  contacts?: {
    emailWithDomain?: string[];
    email?: string[];
    phone?: string[];
  };
  socials?: {
    "X(twitter)"?: string[];
    Facebook?: string[];
    Whatsapp?: string[];
    Instagram?: string[];
    linkedIn?: string[];
  };
  company_name: string;
  source_url: string;
  created_at: string;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/** Strip the `tel:` prefix and URL-decode encoded phone numbers (e.g. `tel:%2B6421…` → `+6421…`) */
const cleanPhone = (raw: string) =>
  decodeURIComponent(raw.replace(/^tel:/i, "")).trim();

const displayContact = (item: LeadRow) => {
  // Legacy scalar fallback (if contacts doesn't exist yet)
  if (!item.contacts && item.email && !isUUID(item.email)) return item.email;
  if (!item.contacts && item.phone) return item.phone;

  if (!item.contacts) return <span className="text-muted-foreground/50">No contact listed</span>;

  const { emailWithDomain, email, phone } = item.contacts;
  const allEmails = [...(emailWithDomain || []), ...(email || [])];
  const allPhones = phone || [];

  let primaryContact = "";
  let extraCount = 0;
  let isVerifiedDomain = false;
  let contactIcon = null;

  if (allEmails.length > 0) {
    primaryContact = allEmails[0];
    extraCount = (allEmails.length - 1) + allPhones.length;
    isVerifiedDomain = !!(emailWithDomain && emailWithDomain.length > 0);
    contactIcon = <Mail className="size-3 mr-1 opacity-70" />;
  } else if (allPhones.length > 0) {
    primaryContact = cleanPhone(allPhones[0]);
    extraCount = allPhones.length - 1;
    contactIcon = <Phone className="size-3 mr-1 opacity-70" />;
  } else {
    return <span className="text-muted-foreground/50">No contact listed</span>;
  }

  const activeSocials = item.socials
    ? Object.entries(item.socials).filter(([_, links]) => Array.isArray(links) && links.length > 0)
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center truncate max-w-[200px]" title={primaryContact}>
          {contactIcon}
          <span className={`truncate ${isVerifiedDomain ? 'text-primary font-medium' : ''}`}>
            {primaryContact}
          </span>
        </div>
        {extraCount > 0 && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">+{extraCount}</Badge>}
      </div>
      
      {activeSocials.length > 0 && (
        <div className="flex items-center gap-1.5 opacity-60">
          {activeSocials.map(([network, links]) => {
            const link = (links as string[])[0];
            return (
              <a key={network} href={link} target="_blank" rel="noreferrer" title={network} className="hover:text-primary transition-colors">
                {network === 'linkedIn' && <Linkedin className="size-3" />}
                {network === 'X(twitter)' && <Twitter className="size-3" />}
                {network === 'Facebook' && <Facebook className="size-3" />}
                {network === 'Instagram' && <Instagram className="size-3" />}
                {network === 'Whatsapp' && <MessageCircle className="size-3" />}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
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
