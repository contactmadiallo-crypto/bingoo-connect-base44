import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, ChevronDown, Phone, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { dbOp, logInvalidate } from "@/lib/dbDebug";

const STAGES = [
  { id: "new",       label: "New",        color: "#6366f1" },
  { id: "contacted", label: "Contacted",  color: "#f59e0b" },
  { id: "qualified", label: "Qualified",  color: "#3b82f6" },
  { id: "proposal",  label: "Proposal",   color: "#8b5cf6" },
  { id: "converted", label: "Converted",  color: "#10b981" },
  { id: "closed",    label: "Closed",     color: "#94a3b8" },
];

const MATTER_TYPES = ["Corporate", "Criminal", "Family", "Immigration", "IP", "Personal Injury", "Real Estate", "Tax", "Other"];

export default function CRMPipelinePanel({ profileId, profileIds: propProfileIds, user, isDark: propDark, onSaved }) {
  const { isDark } = useBingooTheme();
  const dark = propDark ?? isDark;
  const qc = useQueryClient();
  const [activeStage, setActiveStage] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Query ONLY by the active profileId — same as the badge count in BingooDashboard.
  const queryKey = ["crm-leads", profileId];

  const { data: leads = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Lead.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); setEditing(null); toast.success("Saved Successfully"); onSaved?.(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); },
  });

  const openEdit = (l) => {
    setForm({ name: l.name || "", email: l.email || "", phone: l.phone || "", message: l.message || "", status: l.status || "new", description: l.description || "" });
    setEditing(l.id);
  };

  const filtered = activeStage === "all" ? leads : leads.filter(l => l.status === activeStage);

  const stageCounts = Object.fromEntries(STAGES.map(s => [s.id, leads.filter(l => l.status === s.id).length]));

  const card = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = dark ? "text-white" : "text-slate-900";
  const sub = dark ? "text-white/50" : "text-slate-500";
  const inp = dark ? "bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-white/30" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400";

  if (!profileId) return <div className={`text-center py-12 ${sub}`}>Select a profile first.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>CRM Pipeline</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{leads.length} total leads</p>
        </div>
      </div>

      {/* Pipeline stage filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setActiveStage("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${activeStage === "all" ? (dark ? "bg-white/12 border-white/20 text-white" : "bg-slate-800 border-slate-800 text-white") : (dark ? "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20" : "border-slate-200 text-slate-500 hover:border-slate-300")}`}>
          All ({leads.length})
        </button>
        {STAGES.map(s => (
          <button key={s.id} onClick={() => setActiveStage(s.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${activeStage === s.id ? "text-white border-transparent" : (dark ? "border-white/10 text-white/40 hover:text-white/70" : "border-slate-200 text-slate-500 hover:border-slate-300")}`}
            style={activeStage === s.id ? { background: s.color, borderColor: s.color } : {}}>
            {s.label} {stageCounts[s.id] > 0 && <span className="ml-0.5 opacity-70">({stageCounts[s.id]})</span>}
          </button>
        ))}
      </div>

      {/* Stage summary bar */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
          {STAGES.map(s => {
            const pct = leads.length ? (stageCounts[s.id] / leads.length) * 100 : 0;
            return pct > 0 ? <div key={s.id} style={{ width: `${pct}%`, background: s.color }} title={`${s.label}: ${stageCounts[s.id]}`} /> : null;
          })}
          {leads.length === 0 && <div className={`w-full ${dark ? "bg-white/10" : "bg-slate-100"}`} />}
        </div>
        <div className="flex gap-3 flex-wrap">
          {STAGES.filter(s => stageCounts[s.id] > 0).map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className={`text-xs font-semibold ${sub}`}>{s.label}: <span className={`font-black ${head}`}>{stageCounts[s.id]}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className={`rounded-2xl border p-5 space-y-3 ${card}`}>
          <div className="flex items-center justify-between mb-1">
            <p className={`font-bold text-sm ${head}`}>Edit Lead</p>
            <button onClick={() => setEditing(null)} aria-label="Close edit form" className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className={`rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} />
            <input value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className={`rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} />
            <input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className={`rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} />
            <MobileSelect
              value={form.status || "new"}
              onValueChange={(v) => setForm(f => ({ ...f, status: v }))}
              options={STAGES.map(s => ({ value: s.id, label: s.label }))}
              className={`rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`}
            />
          </div>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Notes / matter description…" rows={2}
            className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none ${inp}`} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => updateMutation.mutate({ id: editing, data: form })} disabled={updateMutation.isPending}
              className="rounded-xl gap-1.5 font-bold text-white flex-1" style={{ background: "#0B2E6B" }}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {/* Lead cards */}
      {isLoading ? (
        <div className={`text-center py-10 text-sm ${sub}`}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>No leads in this stage</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(l => {
            const stage = STAGES.find(s => s.id === l.status) || STAGES[0];
            return (
              <div key={l.id} className={`rounded-2xl border p-4 flex gap-3 items-start ${card}`}>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-sm" style={{ background: stage.color }}>
                  {l.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${head}`}>{l.name || "Anonymous"}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: stage.color }}>{stage.label}</span>
                  </div>
                  <div className={`flex items-center gap-3 mt-1 text-xs ${sub}`}>
                    {l.email && <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3" /> {l.email}</span>}
                    {l.phone && <span className="flex items-center gap-0.5 flex-shrink-0"><Phone className="w-3 h-3" /> {l.phone}</span>}
                  </div>
                  {l.description && <p className={`text-xs mt-1.5 line-clamp-2 ${sub}`}>{l.description}</p>}
                  <p className={`text-xs mt-1 ${dark ? "text-white/25" : "text-slate-300"}`}>{l.created_date?.slice(0, 10)}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(l)} aria-label="Edit lead" className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(l.id)} aria-label="Delete lead" className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this lead?"
        description="This action cannot be undone."
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}