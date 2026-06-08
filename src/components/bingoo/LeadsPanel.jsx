import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Phone, Mail, MessageSquare, Inbox } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTS = ["new", "contacted", "closed"];
const STATUS_STYLE = {
  new:       "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  closed:    "bg-slate-100 text-slate-500 border-slate-200",
};

export default function LeadsPanel({ profileId }) {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", profileId],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
  });

  // Real-time: refresh when a new lead is created for this profile
  useEffect(() => {
    if (!profileId) return;
    const unsub = base44.entities.Lead.subscribe((event) => {
      if (event.data?.profile_id === profileId) {
        qc.invalidateQueries({ queryKey: ["leads", profileId] });
      }
    });
    return () => unsub();
  }, [profileId]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Lead.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", profileId] });
      toast.success("Status updated");
    },
  });

  const filtered = leads.filter(l =>
    [l.name, l.phone, l.email, l.message].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const rows = [
      ["Name", "Phone", "Email", "Message", "Preferred Contact", "Status", "Date"],
      ...filtered.map(l => [
        l.name || "", l.phone || "", l.email || "", l.message || "",
        l.preferred_contact_method || "", l.status || "new", l.created_date?.slice(0,10) || ""
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!profileId) return (
    <div className="text-center py-20 text-slate-400">
      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">Set up your profile first to collect leads.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Leads</h2>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} contact{leads.length !== 1 ? "s" : ""} collected</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 border-slate-200 w-full sm:w-56" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={exportCSV} variant="outline" className="gap-2 border-slate-200 flex-shrink-0" disabled={filtered.length === 0}>
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-bold text-slate-700">{search ? "No results found" : "No leads yet"}</p>
          <p className="text-slate-400 text-sm mt-1">{search ? "Try a different search term." : "Visitors who submit the Request Info form will appear here."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <div key={lead.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black flex-shrink-0">
                    {lead.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{lead.name || "Anonymous"}</p>
                    <p className="text-xs text-slate-400">{lead.created_date?.slice(0,10)}</p>
                  </div>
                </div>
                <select
                  value={lead.status || "new"}
                  onChange={e => updateStatus.mutate({ id: lead.id, status: e.target.value })}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${STATUS_STYLE[lead.status || "new"]}`}
                >
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                {lead.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /><a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a></div>}
                {lead.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /><a href={`mailto:${lead.email}`} className="hover:text-blue-600 truncate">{lead.email}</a></div>}
                {lead.message && <div className="flex items-start gap-2 text-sm text-slate-600"><MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{lead.message}</span></div>}
                {lead.preferred_contact_method && (
                  <div className="text-xs font-semibold text-slate-500 mt-2 pt-2 border-t border-slate-50">
                    Prefers: {lead.preferred_contact_method === "WhatsApp" ? "💬" : lead.preferred_contact_method === "Phone" ? "📞" : "📧"} {lead.preferred_contact_method}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}