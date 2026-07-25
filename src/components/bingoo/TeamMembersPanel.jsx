import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Check, User, Phone, Mail, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TYPE_LAWFIRM, TYPE_SALON, TYPE_CORPORATE, TYPE_BUSINESS } from "@/lib/sidebarConfig";

// ── Role options by profile type ──────────────────────────────────────────────
const ROLE_OPTIONS = {
  [TYPE_LAWFIRM]: [
    "Attorney", "Paralegal", "Legal Assistant", "Interpreter",
    "Translator", "Case Manager", "Notary", "Other",
  ],
  [TYPE_SALON]: [
    "Stylist", "Barber", "Nail Technician", "Esthetician",
    "Massage Therapist", "Manager", "Other",
  ],
  [TYPE_CORPORATE]: [
    "Manager", "Sales", "Support", "Admin", "Staff",
    "Developer", "Designer", "HR", "Other",
  ],
  [TYPE_BUSINESS]: [
    "Manager", "Staff", "Sales", "Support", "Admin", "Other",
  ],
};

// ── UI labels by profile type ─────────────────────────────────────────────────
const LABELS = {
  [TYPE_LAWFIRM]: {
    pageTitle: "Legal Team",
    addButton: "Add Legal Professional",
    memberSingular: "Legal Professional",
    memberPlural: "Legal Professionals",
    emptyBody: "Add your first legal professional to get started.",
  },
  [TYPE_SALON]: {
    pageTitle: "Salon Team",
    addButton: "Add Salon Staff",
    memberSingular: "Staff Member",
    memberPlural: "Staff Members",
    emptyBody: "Add your first salon staff member to get started.",
  },
  [TYPE_CORPORATE]: {
    pageTitle: "Team Members",
    addButton: "Add Team Member",
    memberSingular: "Team Member",
    memberPlural: "Team Members",
    emptyBody: "Add your first team member to get started.",
  },
  [TYPE_BUSINESS]: {
    pageTitle: "Team Members",
    addButton: "Add Team Member",
    memberSingular: "Team Member",
    memberPlural: "Team Members",
    emptyBody: "Add your first team member to get started.",
  },
};

const DEFAULT_LABELS = LABELS[TYPE_BUSINESS];

const EMPTY_FORM = {
  name: "", role_type: "", role: "", email: "", phone: "", whatsapp: "",
  bio: "", photo: "", status: "active",
  // Law firm specific
  bar_states: "", languages: "", practice_categories: [], practice_areas: "",
  consultation_fee: "", availability: "", office_address: "",
  education: "", experience: "", awards: "",
  // Salon specific
  specialties: "", services: "",
  // Corporate specific
  department: "",
};

const LEGAL_PRACTICE_CATEGORIES = ["Immigration", "Civil", "Criminal"];

export default function TeamMembersPanel({ profileId, profileType, isDark: propDark, onSaved }) {
  const { isDark } = useBingooTheme();
  const dark = propDark ?? isDark;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Determine type — default to business if not specified
  const type = profileType || TYPE_BUSINESS;
  const labels = LABELS[type] || DEFAULT_LABELS;
  const roleOptions = ROLE_OPTIONS[type] || ROLE_OPTIONS[TYPE_BUSINESS];

  const isLawFirm   = type === TYPE_LAWFIRM;
  const isSalon     = type === TYPE_SALON;
  const isCorporate = type === TYPE_CORPORATE || type === TYPE_BUSINESS;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Merge role_type into role; map specialties → practice_areas for salon
      const payload = { ...data, role: data.role_type || data.role };
      if (payload.specialties) { payload.practice_areas = payload.practice_areas || payload.specialties; }
      if (editing === "new") {
        // Server-side plan entitlement check — free/unentitled plans are rejected even via direct API calls.
        const res = await base44.functions.invoke('createGatedRecord', {
          entity_name: 'TeamMember', profile_id: profileId, data: payload,
        });
        return res.data.record;
      }
      const res = await base44.functions.invoke('createGatedRecord', {
        entity_name: 'TeamMember', profile_id: profileId, op: 'update', record_id: editing, data: payload,
      });
      return res.data.record;
    },
    onSuccess: (saved) => {
      qc.setQueryData(["team-members", profileId], (old = []) => {
        const exists = old.some(m => m.id === saved.id);
        return exists ? old.map(m => m.id === saved.id ? saved : m) : [...old, saved];
      });
      qc.invalidateQueries({ queryKey: ["team-members", profileId] });
      setEditing(null);
      setForm(EMPTY_FORM);
      toast.success("Saved successfully");
      if (onSaved) onSaved();
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('createGatedRecord', {
      entity_name: 'TeamMember', profile_id: profileId, op: 'delete', record_id: id,
    }).then(r => r.data.record),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["team-members", profileId] });
      const prev = qc.getQueryData(["team-members", profileId]);
      qc.setQueryData(["team-members", profileId], (old = []) => old.filter(m => m.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["team-members", profileId], ctx.prev);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["team-members", profileId] });
    },
  });

  const openNew = () => { setForm(EMPTY_FORM); setEditing("new"); };
  const openEdit = (m) => {
    setForm({
      name: m.name || "", role_type: m.role || "", role: m.role || "",
      email: m.email || "", phone: m.phone || "", whatsapp: m.whatsapp || "", bio: m.bio || "",
      photo: m.photo || "", status: m.status || "active",
      bar_states: m.bar_states || "", languages: m.languages || "",
      practice_categories: m.practice_categories || [], practice_areas: m.practice_areas || "",
      consultation_fee: m.consultation_fee || "", availability: m.availability || "",
      office_address: m.office_address || "", education: m.education || "",
      experience: m.experience || "", awards: m.awards || "",
      specialties: m.practice_areas || "", services: m.services || "",
      department: m.department || "",
    });
    setEditing(m.id);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo: file_url }));
    setUploading(false);
  };

  const toggleCat = (cat) => setForm(f => {
    const cats = f.practice_categories || [];
    return { ...f, practice_categories: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat] };
  });

  const field = (key, placeholder, extra = {}) => (
    <input
      key={key}
      value={form[key] || ""}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      placeholder={placeholder}
      className={`rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${inputCls}`}
      {...extra}
    />
  );

  const textArea = (key, placeholder, rows = 2) => (
    <textarea
      key={key}
      value={form[key] || ""}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none transition-colors ${inputCls}`}
    />
  );

  // Styles
  const card   = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head   = dark ? "text-white" : "text-slate-900";
  const sub    = dark ? "text-white/50" : "text-slate-500";
  const inputCls = dark
    ? "bg-[#1a2235] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400";

  if (!profileId) return <div className={`text-center py-12 ${sub}`}>Select a profile first.</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>{labels.pageTitle}</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{members.length} {members.length === 1 ? labels.memberSingular : labels.memberPlural}</p>
        </div>
        <Button onClick={openNew} size="sm" className="rounded-xl gap-1.5 font-bold text-white" style={{ background: "#0b2149" }}>
          <Plus className="w-3.5 h-3.5" /> {labels.addButton}
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
          <div className="flex items-center justify-between">
            <p className={`font-bold text-sm ${head}`}>
              {editing === "new" ? labels.addButton : `Edit ${labels.memberSingular}`}
            </p>
            <button onClick={() => setEditing(null)} aria-label="Close form"
              className={`w-11 h-11 rounded-full flex items-center justify-center ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo upload */}
          <div className="flex items-center gap-3">
            {form.photo
              ? <img src={form.photo} className="w-14 h-14 rounded-full object-cover border-2 border-blue-400" alt="" />
              : <div className={`w-14 h-14 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-slate-100"}`}>
                  <User className={`w-6 h-6 ${sub}`} />
                </div>
            }
            <label className={`cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${dark ? "border-white/15 text-white/60 hover:bg-white/10" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Common: name */}
          <div className="grid grid-cols-2 gap-3">
            {field("name", "Full Name *")}

            {/* Role type dropdown */}
            <Select
              value={form.role_type || ""}
              onValueChange={(v) => setForm(f => ({ ...f, role_type: v }))}>
              <SelectTrigger className={`rounded-xl text-sm border ${inputCls}`} style={dark ? { background: "#1a2235" } : {}}>
                <SelectValue placeholder="Select Role..." />
              </SelectTrigger>
              <SelectContent className={dark ? "bg-[#1a2235] border-white/10" : ""}>
                {roleOptions.map(r => (
                  <SelectItem key={r} value={r} className={dark ? "text-white/80 focus:bg-white/10 focus:text-white" : ""}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {field("email", "Email")}
            {field("phone", "Phone")}
            {isSalon && field("whatsapp", "WhatsApp number (e.g. +1234567890)")}
          </div>

          {/* ── LAW FIRM specific ── */}
          {isLawFirm && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {field("bar_states", "Bar Admitted States (e.g. NY, NJ, FL)")}
                {field("languages", "Languages (e.g. English, Spanish, French)")}
                {field("consultation_fee", "Consultation Fee (e.g. $150/hr)")}
                {field("availability", "Availability (e.g. Mon–Fri 9am–5pm)")}
                {field("office_address", "Office Address")}
                {field("practice_areas", "Practice Areas (comma-separated)")}
              </div>

              {/* Practice categories */}
              <div>
                <p className={`text-xs font-bold mb-2 ${sub}`}>Practice Categories</p>
                <div className="flex gap-2 flex-wrap">
                  {LEGAL_PRACTICE_CATEGORIES.map(cat => {
                    const colors = { Immigration: "#0b2149", Civil: "#7c3aed", Criminal: "#b91c1c" };
                    const checked = (form.practice_categories || []).includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCat(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${checked ? "text-white border-transparent" : (dark ? "border-white/15 text-white/50 hover:border-white/30" : "border-slate-200 text-slate-500 hover:border-slate-300")}`}
                        style={checked ? { background: colors[cat] } : {}}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {textArea("bio", "Bio / About the attorney", 2)}
              {textArea("education", "Education (e.g. JD – NYU Law, 2010)", 2)}
              {textArea("experience", "Experience highlights", 2)}
              {textArea("awards", "Awards, bar memberships, honors", 2)}
            </>
          )}

          {/* ── SALON specific ── */}
          {isSalon && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {field("practice_areas", "Specialties (e.g. Balayage, Acrylics, Color)")}
                {field("languages", "Languages (e.g. English, Spanish)")}
                {field("consultation_fee", "Rate / Price (e.g. $35+)")}
                {field("availability", "Availability (e.g. Mon–Sat 9am–6pm)")}
                {field("experience", "Experience (e.g. 5+ years)")}
              </div>
              {textArea("bio", "Short bio — shown in stylist profile…", 2)}
              {textArea("education", "Training / Certifications (optional)", 2)}
              {textArea("awards", "Awards or recognitions (optional)", 2)}
            </>
          )}

          {/* ── CORPORATE / BUSINESS specific ── */}
          {isCorporate && !isLawFirm && !isSalon && (
            <>
              {field("department", "Department (e.g. Sales, Engineering)")}
              {textArea("bio", "Short bio…", 2)}
            </>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            <p className={`text-xs font-bold ${sub}`}>Status:</p>
            {["active", "inactive"].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.status === s ? (s === "active" ? "bg-emerald-500 text-white border-transparent" : "bg-slate-500 text-white border-transparent") : (dark ? "border-white/15 text-white/40" : "border-slate-200 text-slate-500")}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || saveMutation.isPending}
              className="rounded-xl gap-1.5 font-bold text-white flex-1" style={{ background: "#0b2149" }}>
              <Check className="w-3.5 h-3.5" /> {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}
              className={`rounded-xl ${dark ? "border-white/15 text-white/60 hover:bg-white/10" : ""}`}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      {isLoading ? (
        <div className={`text-center py-10 text-sm ${sub}`}>Loading…</div>
      ) : members.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <User className={`w-10 h-10 mx-auto mb-3 ${dark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-semibold text-sm ${sub}`}>No {labels.memberPlural.toLowerCase()} yet</p>
          <p className={`text-xs mt-1 mb-4 ${dark ? "text-white/30" : "text-slate-400"}`}>{labels.emptyBody}</p>
          <Button size="sm" onClick={openNew} className="rounded-xl gap-1.5 font-bold text-white" style={{ background: "#0b2149" }}>
            <Plus className="w-3.5 h-3.5" /> {labels.addButton}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map(m => (
            <div key={m.id} className={`rounded-2xl border p-4 flex gap-3 ${card}`}>
              {m.photo
                ? <img src={m.photo} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-400/30" alt="" />
                : <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-lg" style={{ background: "#0b2149" }}>
                    {m.name?.charAt(0)}
                  </div>
              }
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className={`font-bold text-sm truncate ${head}`}>{m.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${m.status === "active" ? (dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700") : (dark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")}`}>
                    {m.status}
                  </span>
                </div>
                {m.role && <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: "#f97316" }}>{m.role}</p>}
                {isLawFirm && (m.practice_categories || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(m.practice_categories || []).map(c => {
                      const catColors = { Immigration: "#0b2149", Civil: "#7c3aed", Criminal: "#b91c1c" };
                      return <span key={c} className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: catColors[c] || "#0b2149" }}>{c}</span>;
                    })}
                  </div>
                )}
                {isLawFirm && m.bar_states && <p className={`text-xs mt-1 ${sub}`}>Bar: {m.bar_states}</p>}
                {m.languages && <p className={`text-xs ${sub}`}>Languages: {m.languages}</p>}
                {isSalon && m.practice_areas && <p className={`text-xs mt-1 ${sub}`}>Specialties: {m.practice_areas}</p>}
                {isCorporate && m.department && <p className={`text-xs mt-1 ${sub}`}>Dept: {m.department}</p>}
                <div className={`flex items-center gap-2 mt-1 text-xs ${sub}`}>
                  {m.email && <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3" /> {m.email}</span>}
                  {m.phone && <span className="flex items-center gap-0.5 flex-shrink-0"><Phone className="w-3 h-3" /> {m.phone}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => openEdit(m)} aria-label={`Edit ${m.name}`}
                  className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(m.id)} aria-label={`Delete ${m.name}`}
                  className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Remove ${labels.memberSingular.toLowerCase()}?`}
        description="This action cannot be undone."
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}