import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Phone, Mail, MessageSquare, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const STATUS_OPTS = ["new", "contacted", "closed"];
const STATUS_STYLE_DARK = {
  new:       "bg-amber-500/20 text-amber-300 border-amber-500/30",
  contacted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  closed:    "bg-white/10 text-white/40 border-white/10",
};
const STATUS_STYLE_LIGHT = {
  new:       "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  closed:    "bg-slate-100 text-slate-500 border-slate-200",
};

export default function LeadsPanel({ profileId }) {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { isDark } = useBingooTheme();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", profileId],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
    refetchOnMount: "always",
  });

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

  // Theme tokens
  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const mutedText = isDark ? "text-white/30" : "text-slate-400";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const inputClass = isDark
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/20"
    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400";
  const statusStyle = isDark ? STATUS_STYLE_DARK : STATUS_STYLE_LIGHT;
  const nameText = isDark ? "text-white" : "text-slate-900";
  const dateText = isDark ? "text-white/35" : "text-slate-400";
  const contactText = isDark ? "text-white/60" : "text-slate-600";
  const prefBorder = isDark ? "border-white/8" : "border-slate-50";
  const avatarBg = isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600";
  const exportBtnClass = isDark
    ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";

  if (!profileId) return (
    <div className="text-center py-20">
      <Inbox className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "opacity-30 text-slate-300"}`} />
      <p className={`font-semibold ${subText}`}>Set up your profile first to collect leads.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${headText}`}>Leads</h2>
          <p className={`text-sm mt-0.5 ${subText}`}>{leads.length} contact{leads.length !== 1 ? "s" : ""} collected</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
            <Input className={`pl-9 w-full sm:w-56 ${inputClass}`} placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={exportCSV} variant="outline" className={`gap-2 flex-shrink-0 ${exportBtnClass}`} disabled={filtered.length === 0}>
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <Inbox className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-bold ${headText}`}>{search ? "No results found" : "No leads yet"}</p>
          <p className={`text-sm mt-1 ${mutedText}`}>{search ? "Try a different search term." : "Visitors who submit the Request Info form will appear here."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <div key={lead.id} className="rounded-2xl p-5 hover:shadow-md transition-shadow"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0 ${avatarBg}`}>
                    {lead.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className={`font-bold ${nameText}`}>{lead.name || "Anonymous"}</p>
                    <p className={`text-xs ${dateText}`}>{lead.created_date?.slice(0,10)}</p>
                  </div>
                </div>
                <select
                  value={lead.status || "new"}
                  onChange={e => updateStatus.mutate({ id: lead.id, status: e.target.value })}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${statusStyle[lead.status || "new"]}`}
                  style={isDark ? { background: "transparent" } : {}}
                >
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                {lead.phone && <div className={`flex items-center gap-2 text-sm ${contactText}`}><Phone className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`tel:${lead.phone}`} className="hover:text-blue-500">{lead.phone}</a></div>}
                {lead.email && <div className={`flex items-center gap-2 text-sm ${contactText}`}><Mail className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`mailto:${lead.email}`} className="hover:text-blue-500 truncate">{lead.email}</a></div>}
                {lead.message && <div className={`flex items-start gap-2 text-sm ${contactText}`}><MessageSquare className={`w-3.5 h-3.5 ${mutedText} mt-0.5 flex-shrink-0`} /><span className="line-clamp-2">{lead.message}</span></div>}
                {lead.preferred_contact_method && (
                  <div className={`text-xs font-semibold mt-2 pt-2 border-t ${isDark ? "text-white/35 border-white/8" : "text-slate-500 border-slate-50"}`}>
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