import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Button } from "@/components/ui/button";
import { X, Phone, Mail, MessageSquare, FileText, User, ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import { LEGAL_LEAD_STAGES, URGENCY_LABELS, CATEGORY_COLORS, LEGAL_CATEGORIES, LEGAL_SERVICES } from "@/lib/legalData";

const LEGAL_CRM_STAGES = [
  { id: "new",                    label: "New Lead",              color: "#6366f1" },
  { id: "contacted",              label: "Contacted",             color: "#f59e0b" },
  { id: "consultation_scheduled", label: "Consult Scheduled",     color: "#3b82f6" },
  { id: "documents_requested",    label: "Docs Requested",        color: "#06b6d4" },
  { id: "retained",               label: "Retained",              color: "#10b981" },
  { id: "declined",               label: "Declined",              color: "#ef4444" },
  { id: "closed",                 label: "Closed",                color: "#94a3b8" },
];

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-slate-400 font-semibold min-w-[120px] flex-shrink-0">{label}:</span>
      <span className="text-slate-700 break-words">{value}</span>
    </div>
  );
}

function YesNoBadge({ value }) {
  if (!value) return null;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${value === "yes" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
      {value === "yes" ? "Yes" : "No"}
    </span>
  );
}

function LeadCard({ lead, dark, attorneys, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editStatus, setEditStatus] = useState(lead.status || "new");
  const [editAtty, setEditAtty] = useState(lead.assigned_attorney_id || "");
  const [editNotes, setEditNotes] = useState(lead.description || "");
  const [saving, setSaving] = useState(false);

  const stage = LEGAL_CRM_STAGES.find(s => s.id === lead.status) || LEGAL_CRM_STAGES[0];
  const urgency = URGENCY_LABELS[lead.urgency];
  const catColor = CATEGORY_COLORS[lead.legal_category] || "#6366f1";

  const card = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = dark ? "text-white" : "text-slate-900";
  const sub = dark ? "text-white/50" : "text-slate-500";
  const inp = dark ? "bg-white/8 border-white/15 text-white focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400";

  const handleSave = async () => {
    setSaving(true);
    const atty = attorneys.find(a => a.id === editAtty);
    await onUpdate(lead.id, {
      status: editStatus,
      assigned_attorney_id: editAtty || null,
      assigned_attorney_name: atty?.name || null,
      description: editNotes,
    });
    setSaving(false);
  };

  return (
    <div className={`rounded-2xl border transition-all ${card}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-sm" style={{ background: catColor }}>
            {lead.name?.charAt(0) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${head}`}>{lead.name || "Anonymous"}</p>
              {lead.legal_category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: catColor }}>{lead.legal_category}</span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: stage.color }}>{stage.label}</span>
              {urgency && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: urgency.color }}>{urgency.label}</span>
              )}
            </div>

            {lead.legal_service && <p className={`text-xs font-semibold mt-0.5 ${sub}`}>{lead.legal_service}</p>}

            <div className={`flex items-center gap-3 mt-1 text-[11px] flex-wrap ${sub}`}>
              {lead.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {lead.email}</span>}
              {lead.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {lead.phone}</span>}
              {lead.assigned_attorney_name && <span className="flex items-center gap-0.5"><User className="w-3 h-3" /> {lead.assigned_attorney_name}</span>}
              <span className={`text-[10px] ${dark ? "text-white/25" : "text-slate-300"}`}>{lead.created_date?.slice(0, 10)}</span>
            </div>
          </div>

          <button onClick={() => setExpanded(e => !e)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className={`border-t px-4 pb-4 pt-3 space-y-4 ${dark ? "border-white/8" : "border-slate-100"}`}>
          {/* Admin controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${sub}`}>Status</p>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${inp}`}>
                {LEGAL_CRM_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${sub}`}>Assign Attorney</p>
              <select value={editAtty} onChange={e => setEditAtty(e.target.value)}
                className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${inp}`}>
                <option value="">Unassigned</option>
                {attorneys.map(a => <option key={a.id} value={a.id}>{a.name}{a.role ? ` – ${a.role}` : ""}</option>)}
              </select>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${sub}`}>Internal Notes</p>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                placeholder="Add notes…"
                className={`w-full rounded-xl px-3 py-2 text-sm border outline-none resize-none transition-colors ${inp}`} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="rounded-xl font-bold text-white" style={{ background: "#0B2E6B" }}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <button onClick={() => onDelete(lead.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${dark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
              Delete
            </button>
          </div>

          {/* All intake details */}
          <div className={`rounded-xl border p-3 space-y-1.5 ${dark ? "border-white/8 bg-white/3" : "border-slate-100 bg-slate-50"}`}>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${sub}`}>Client Intake Details</p>
            <DetailRow label="Preferred Language" value={lead.preferred_language} />
            <DetailRow label="Preferred Contact" value={lead.preferred_contact_method} />
            <DetailRow label="Consult Date" value={lead.preferred_consult_date} />
            <DetailRow label="Message" value={lead.message} />

            {lead.legal_category === "Immigration" && <>
              <div className={`text-[10px] font-black uppercase tracking-wider mt-3 mb-1 ${dark ? "text-blue-300" : "text-blue-700"}`}>Immigration Details</div>
              <DetailRow label="A-Number" value={lead.immigration_a_number} />
              <DetailRow label="USCIS Account #" value={lead.immigration_uscis_account} />
              <DetailRow label="Receipt #" value={lead.immigration_receipt_number} />
              <DetailRow label="Case #" value={lead.immigration_case_number} />
              <DetailRow label="Court Date" value={lead.immigration_court_date} />
              <DetailRow label="Court Location" value={lead.immigration_court_location} />
              <DetailRow label="Current Status" value={lead.immigration_current_status} />
              <DetailRow label="Process Type" value={lead.immigration_process_type} />
              <DetailRow label="Country of Origin" value={lead.immigration_country_of_origin} />
              <DetailRow label="Date of Entry" value={lead.immigration_date_of_entry} />
              <DetailRow label="Manner of Entry" value={lead.immigration_manner_of_entry} />
              <DetailRow label="Work Permit Status" value={lead.immigration_work_permit_status} />
              <DetailRow label="Deadlines" value={lead.immigration_deadlines} />
              <div className="flex flex-wrap gap-3 mt-1.5">
                {lead.immigration_prior_asylum !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Prior Asylum: <YesNoBadge value={lead.immigration_prior_asylum} /></div>}
                {lead.immigration_detained !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Detained: <YesNoBadge value={lead.immigration_detained} /></div>}
                {lead.immigration_prior_removal !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Prior Removal: <YesNoBadge value={lead.immigration_prior_removal} /></div>}
                {lead.immigration_family_petition !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Family Petition: <YesNoBadge value={lead.immigration_family_petition} /></div>}
              </div>
              <DetailRow label="Notes" value={lead.immigration_notes} />
            </>}

            {lead.legal_category === "Civil" && <>
              <div className={`text-[10px] font-black uppercase tracking-wider mt-3 mb-1 ${dark ? "text-purple-300" : "text-purple-700"}`}>Civil Matter Details</div>
              <DetailRow label="Matter Type" value={lead.civil_matter_type} />
              <DetailRow label="Incident Date" value={lead.civil_incident_date} />
              <DetailRow label="Incident Location" value={lead.civil_incident_location} />
              <DetailRow label="Opposing Party" value={lead.civil_opposing_party} />
              <DetailRow label="Case #" value={lead.civil_case_number} />
              <DetailRow label="Insurance Claim" value={lead.civil_insurance_claim} />
              <DetailRow label="Damages" value={lead.civil_damages_description} />
              <DetailRow label="Court Date" value={lead.civil_court_date} />
            </>}

            {lead.legal_category === "Criminal" && <>
              <div className={`text-[10px] font-black uppercase tracking-wider mt-3 mb-1 ${dark ? "text-red-300" : "text-red-700"}`}>Criminal Matter Details</div>
              <DetailRow label="Charge" value={lead.criminal_charge} />
              <DetailRow label="Arrest Date" value={lead.criminal_arrest_date} />
              <DetailRow label="Court Date" value={lead.criminal_court_date} />
              <DetailRow label="Court Location" value={lead.criminal_court_location} />
              <DetailRow label="Docket #" value={lead.criminal_docket_number} />
              <DetailRow label="Precinct" value={lead.criminal_precinct} />
              <DetailRow label="Bail Status" value={lead.criminal_bail_status} />
              <div className="flex flex-wrap gap-3 mt-1.5">
                {lead.criminal_prior_history !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Prior History: <YesNoBadge value={lead.criminal_prior_history} /></div>}
                {lead.criminal_detained !== "" && <div className="flex items-center gap-1.5 text-xs text-slate-500">Detained: <YesNoBadge value={lead.criminal_detained} /></div>}
              </div>
            </>}

            {lead.document_urls?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Uploaded Documents</p>
                <div className="flex flex-wrap gap-2">
                  {lead.document_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 hover:bg-blue-100 transition-colors">
                      <FileText className="w-3 h-3" /> Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LegalLeadsDashboard({ profileId, isDark: propDark, onSaved }) {
  const { isDark } = useBingooTheme();
  const dark = propDark ?? isDark;
  const qc = useQueryClient();
  const [filterStage, setFilterStage] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["legal-leads", profileId],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
  });

  const { data: attorneys = [] } = useQuery({
    queryKey: ["attorneys", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId, status: "active" }, "order"),
    enabled: !!profileId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["legal-leads", profileId] }); toast.success("Saved Successfully"); onSaved?.(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legal-leads", profileId] }),
  });

  const filtered = leads.filter(l => {
    if (filterStage !== "all" && l.status !== filterStage) return false;
    if (filterCat !== "all" && l.legal_category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (l.name || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.legal_service || "").toLowerCase().includes(q);
    }
    return true;
  });

  const stageCounts = Object.fromEntries(LEGAL_CRM_STAGES.map(s => [s.id, leads.filter(l => l.status === s.id).length]));

  const handleExportCSV = () => {
    const rows = [
      ["Name","Email","Phone","Category","Service","Status","Urgency","Attorney","Date"],
      ...filtered.map(l => [
        l.name, l.email, l.phone, l.legal_category, l.legal_service,
        l.status, l.urgency, l.assigned_attorney_name, l.created_date?.slice(0,10)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "legal-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const card = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = dark ? "text-white" : "text-slate-900";
  const sub = dark ? "text-white/50" : "text-slate-500";
  const inp = dark ? "bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-white/30" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400";

  if (!profileId) return <div className={`text-center py-12 ${sub}`}>Select a profile first.</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-lg font-black ${head}`}>Legal Leads &amp; CRM</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{leads.length} total leads · {attorneys.length} attorneys</p>
        </div>
        <button onClick={handleExportCSV}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${dark ? "border-white/15 text-white/60 hover:bg-white/10" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Pipeline bar */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden mb-3">
          {LEGAL_CRM_STAGES.map(s => {
            const pct = leads.length ? (stageCounts[s.id] / leads.length) * 100 : 0;
            return pct > 0 ? <div key={s.id} style={{ width: `${pct}%`, background: s.color }} title={`${s.label}: ${stageCounts[s.id]}`} /> : null;
          })}
          {leads.length === 0 && <div className={`w-full rounded-full ${dark ? "bg-white/10" : "bg-slate-100"}`} />}
        </div>
        <div className="flex gap-3 flex-wrap">
          {LEGAL_CRM_STAGES.filter(s => stageCounts[s.id] > 0).map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className={`text-xs font-semibold ${sub}`}>{s.label}: <span className={`font-black ${head}`}>{stageCounts[s.id]}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search leads…"
          className={`rounded-xl px-3 py-2 text-sm border outline-none transition-colors flex-1 min-w-[160px] ${inp}`} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className={`rounded-xl px-3 py-2 text-sm border outline-none transition-colors ${inp}`}>
          <option value="all">All Categories</option>
          {LEGAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
          className={`rounded-xl px-3 py-2 text-sm border outline-none transition-colors ${inp}`}>
          <option value="all">All Stages</option>
          {LEGAL_CRM_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Leads */}
      {isLoading ? (
        <div className={`text-center py-10 text-sm ${sub}`}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>{leads.length === 0 ? "No legal leads yet." : "No leads match filters."}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(l => (
            <LeadCard key={l.id} lead={l} dark={dark} attorneys={attorneys}
              onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
              onDelete={(id) => { if (confirm("Delete this lead?")) deleteMutation.mutate(id); }} />
          ))}
        </div>
      )}
    </div>
  );
}