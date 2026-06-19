import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Search, Download, Phone, Mail, MessageSquare, Inbox, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";

// Full CRM pipeline statuses
const CRM_STATUSES = [
  { id: "new",       label: "New",       color: "#f59e0b", darkCls: "bg-amber-500/20 text-amber-300 border-amber-500/30",   lightCls: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "contacted", label: "Contacted", color: "#3b82f6", darkCls: "bg-blue-500/20 text-blue-300 border-blue-500/30",     lightCls: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "qualified", label: "Qualified", color: "#8b5cf6", darkCls: "bg-violet-500/20 text-violet-300 border-violet-500/30", lightCls: "bg-violet-50 text-violet-700 border-violet-200" },
  { id: "won",       label: "Won",       color: "#10b981", darkCls: "bg-green-500/20 text-green-300 border-green-500/30",   lightCls: "bg-green-50 text-green-700 border-green-200" },
  { id: "lost",      label: "Lost",      color: "#ef4444", darkCls: "bg-red-500/20 text-red-300 border-red-500/30",         lightCls: "bg-red-50 text-red-600 border-red-200" },
];

const ALL_STATUS_IDS = CRM_STATUSES.map(s => s.id);

function getStatusStyle(status, isDark) {
  const s = CRM_STATUSES.find(x => x.id === status);
  if (!s) return isDark ? "bg-white/10 text-white/40 border-white/10" : "bg-slate-100 text-slate-500 border-slate-200";
  return isDark ? s.darkCls : s.lightCls;
}

export default function LeadsPanel({ profileId }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");
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
      if (event.data?.profile_id === profileId) qc.invalidateQueries({ queryKey: ["leads", profileId] });
    });
    return () => unsub();
  }, [profileId]);

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", profileId] });
      toast.success("Lead updated");
      setNoteFor(null); setNoteText("");
    },
  });

  const filtered = leads
    .filter(l => statusFilter === "all" || (l.status || "new") === statusFilter)
    .filter(l => !search || [l.name, l.phone, l.email, l.message].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const exportCSV = () => {
    const rows = [["Name", "Phone", "Email", "Message", "Status", "Source", "Preferred Contact", "Date"]];
    filtered.forEach(l => rows.push([l.name||"", l.phone||"", l.email||"", l.message||"", l.status||"new", l.source||"", l.preferred_contact_method||"", l.created_date?.slice(0,10)||""]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  // Conversion stats
  const won = leads.filter(l => l.status === "won").length;
  const contacted = leads.filter(l => l.status !== "new").length;
  const convRate = leads.length ? Math.round((won / leads.length) * 100) : 0;

  // Theme tokens
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/30" : "text-slate-400";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const inputClass = isDark
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/20"
    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400";
  const noteAreaClass = isDark
    ? "w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 placeholder:text-white/25"
    : "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 placeholder:text-slate-400";
  const avatarBg = isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600";

  if (!profileId) return (
    <div className="text-center py-20">
      <Inbox className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "opacity-30 text-slate-300"}`} />
      <p className={`font-semibold ${subText}`}>Set up your profile first to collect leads.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: leads.length, color: "#f59e0b" },
          { label: "Contacted", value: contacted, color: "#3b82f6" },
          { label: "Won", value: won, color: "#10b981" },
          { label: "Conversion", value: `${convRate}%`, color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 border text-center" style={{ background: cardBg, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
            <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
            <p className={`text-xs mt-0.5 ${mutedText}`}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${headText}`}>Leads CRM</h2>
          <p className={`text-sm mt-0.5 ${subText}`}>{leads.length} lead{leads.length !== 1 ? "s" : ""} collected</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
            <input className={`pl-9 w-full sm:w-56 text-sm rounded-xl px-3 py-2 border outline-none ${inputClass}`} placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={exportCSV} variant="outline" disabled={filtered.length === 0}
            className={`gap-2 flex-shrink-0 ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Status pipeline filters */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setStatusFilter("all")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: statusFilter === "all" ? (isDark ? "rgba(255,255,255,0.12)" : "#1e293b") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
            color: statusFilter === "all" ? (isDark ? "#fff" : "#fff") : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)"),
          }}>
          All ({leads.length})
        </button>
        {CRM_STATUSES.map(s => {
          const count = leads.filter(l => (l.status || "new") === s.id).length;
          const isActive = statusFilter === s.id;
          return (
            <button key={s.id} onClick={() => setStatusFilter(s.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isActive ? s.color + "25" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                border: `1px solid ${isActive ? s.color + "60" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                color: isActive ? s.color : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)"),
              }}>
              {s.label} {count > 0 && <span className="font-black ml-0.5">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Lead cards */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <Inbox className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-bold ${headText}`}>{search ? "No results found" : "No leads yet"}</p>
          <p className={`text-sm mt-1 ${mutedText}`}>{search ? "Try a different search term." : "Visitors who submit the contact form will appear here."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <div key={lead.id} className="rounded-2xl p-5 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              {/* Lead header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0 ${avatarBg}`}>
                    {lead.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${headText}`}>{lead.name || "Anonymous"}</p>
                    <p className={`text-xs ${mutedText}`}>{lead.created_date?.slice(0,10)}{lead.source ? ` · ${lead.source}` : ""}</p>
                  </div>
                </div>
                <select
                  value={lead.status || "new"}
                  onChange={e => updateLead.mutate({ id: lead.id, data: { status: e.target.value } })}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${getStatusStyle(lead.status || "new", isDark)}`}
                  style={isDark ? { background: "rgba(15,23,42,0.9)" } : {}}
                >
                  {CRM_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5">
                {lead.phone && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/60" : "text-slate-600"}`}><Phone className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`tel:${lead.phone}`} className="hover:text-blue-500">{lead.phone}</a></div>}
                {lead.email && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/60" : "text-slate-600"}`}><Mail className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`mailto:${lead.email}`} className="hover:text-blue-500 truncate">{lead.email}</a></div>}
                {lead.message && <div className={`flex items-start gap-2 text-sm ${isDark ? "text-white/60" : "text-slate-600"}`}><MessageSquare className={`w-3.5 h-3.5 ${mutedText} mt-0.5 flex-shrink-0`} /><span className="line-clamp-2">{lead.message}</span></div>}
                {lead.legal_category && <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>{lead.legal_category}{lead.urgency ? ` · ${lead.urgency}` : ""}</span>}
                {lead.preferred_contact_method && (
                  <div className={`text-xs font-semibold mt-1 pt-2 border-t ${isDark ? "text-white/35 border-white/8" : "text-slate-500 border-slate-100"}`}>
                    Prefers: {lead.preferred_contact_method === "WhatsApp" ? "💬" : lead.preferred_contact_method === "Phone" ? "📞" : "📧"} {lead.preferred_contact_method}
                  </div>
                )}
              </div>

              {/* Internal note */}
              {noteFor === lead.id ? (
                <div className="space-y-2">
                  <textarea className={noteAreaClass} rows={2} placeholder="CRM notes..."
                    value={noteText} onChange={e => setNoteText(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateLead.mutate({ id: lead.id, data: { description: noteText } })} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setNoteFor(null); setNoteText(""); }} className={`text-xs ${isDark ? "border-white/10 text-white/50" : ""}`}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setNoteFor(lead.id); setNoteText(lead.description || ""); }} className={`flex items-center gap-1.5 text-xs transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
                  <MessageSquare className="w-3.5 h-3.5" />{lead.description ? "Edit note" : "Add CRM note"}
                </button>
              )}
              {lead.description && <p className={`text-xs rounded-xl p-3 ${isDark ? "text-blue-300 bg-blue-500/10" : "text-blue-600 bg-blue-50"}`}>📝 {lead.description}</p>}

              {/* Quick actions */}
              <div className="flex gap-2 pt-1">
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold text-center bg-green-600 hover:bg-green-500 text-white transition-colors">
                    💬 WhatsApp
                  </a>
                )}
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-colors ${isDark ? "bg-white/8 hover:bg-white/12 text-white/70" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
                    📞 Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}