import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { toast } from "sonner";
import { dbOp, logInvalidate } from "@/lib/dbDebug";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Check, User, Phone, Mail, Upload } from "lucide-react";
import { LEGAL_CATEGORIES, LEGAL_SERVICES } from "@/lib/legalData";

const EMPTY = {
  name: "", role: "", email: "", phone: "", whatsapp: "", bio: "",
  education: "", experience: "", awards: "", bar_states: "", languages: "",
  practice_categories: [], practice_areas: "", consultation_fee: "",
  availability: "", office_address: "", status: "active"
};

function CategoryCheckbox({ cat, checked, onChange, dark }) {
  const colors = { Immigration: "#0B2E6B", Civil: "#7c3aed", Criminal: "#b91c1c" };
  return (
    <button type="button" onClick={() => onChange(cat)}
      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${checked ? "text-white border-transparent" : (dark ? "border-white/15 text-white/50 hover:border-white/30" : "border-slate-200 text-slate-500 hover:border-slate-300")}`}
      style={checked ? { background: colors[cat] } : {}}>
      {cat === "Immigration" ? "🌎" : cat === "Civil" ? "⚖️" : "🔒"} {cat}
    </button>
  );
}

export default function TeamMembersPanel({ profileId, isDark: propDark, planLabel = "", onSaved }) {
  const { isDark } = useBingooTheme();
  const dark = propDark ?? isDark;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const isLawFirm = planLabel?.toLowerCase().includes("law") || planLabel?.toLowerCase().includes("firm");
  const memberLabel = isLawFirm ? "Attorney" : "Team Member";

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing === "new"
        ? dbOp("TeamMember", "create", profileId, () => base44.entities.TeamMember.create({ ...data, profile_id: profileId }))
        : dbOp("TeamMember", "update", profileId, () => base44.entities.TeamMember.update(editing, data)),
    onSuccess: () => {
      logInvalidate(["team-members", profileId]);
      qc.invalidateQueries({ queryKey: ["team-members", profileId] }); 
      setEditing(null); 
      setForm(EMPTY);
      toast.success("Saved Successfully");
      onSaved?.();
    },
    onError: (err) => {
      console.error("Save error:", err);
      toast.error(`Failed to save: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dbOp("TeamMember", "delete", profileId, () => base44.entities.TeamMember.delete(id)),
    onSuccess: () => { logInvalidate(["team-members", profileId]); qc.invalidateQueries({ queryKey: ["team-members", profileId] }); },
  });

  const openNew = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (m) => {
    setForm({
      name: m.name || "", role: m.role || "", email: m.email || "",
      phone: m.phone || "", whatsapp: m.whatsapp || "", bio: m.bio || "",
      education: m.education || "", experience: m.experience || "", awards: m.awards || "",
      bar_states: m.bar_states || "", languages: m.languages || "",
      practice_categories: m.practice_categories || [],
      practice_areas: m.practice_areas || "", consultation_fee: m.consultation_fee || "",
      availability: m.availability || "", office_address: m.office_address || "",
      status: m.status || "active", photo: m.photo || ""
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

  const toggleCat = (cat) => {
    setForm(f => {
      const cats = f.practice_categories || [];
      return { ...f, practice_categories: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat] };
    });
  };

  const card = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = dark ? "text-white" : "text-slate-900";
  const sub = dark ? "text-white/50" : "text-slate-500";
  const input = dark
    ? "bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-white/30"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400";

  if (!profileId) return <div className={`text-center py-12 ${sub}`}>Select a profile first.</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>{isLawFirm ? "Attorney Profiles" : "Team Members"}</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{members.length} {members.length === 1 ? memberLabel : `${memberLabel}s`}</p>
        </div>
        <Button onClick={openNew} size="sm" className="rounded-xl gap-1.5 font-bold text-white" style={{ background: "#0B2E6B" }}>
          <Plus className="w-3.5 h-3.5" /> Add {memberLabel}
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
          <div className="flex items-center justify-between">
            <p className={`font-bold text-sm ${head}`}>{editing === "new" ? `New ${memberLabel}` : `Edit ${memberLabel}`}</p>
            <button onClick={() => setEditing(null)} className={`w-7 h-7 rounded-full flex items-center justify-center ${dark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}><X className="w-3.5 h-3.5" /></button>
          </div>

          {/* Photo */}
          <div className="flex items-center gap-3">
            {form.photo
              ? <img src={form.photo} className="w-14 h-14 rounded-full object-cover border-2 border-blue-400" alt="" />
              : <div className={`w-14 h-14 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-slate-100"}`}><User className={`w-6 h-6 ${sub}`} /></div>
            }
            <label className={`cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${dark ? "border-white/15 text-white/60 hover:bg-white/10" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "name", placeholder: "Full name *" },
              { key: "role", placeholder: isLawFirm ? "e.g. Partner, Associate" : "e.g. Stylist, Manager" },
              { key: "email", placeholder: "Email" },
              { key: "phone", placeholder: "Phone" },
              ...(isLawFirm ? [{ key: "whatsapp", placeholder: "WhatsApp Number" }] : []),
              ...(isLawFirm ? [{ key: "consultation_fee", placeholder: "Consultation Fee (e.g. $150)" }] : []),
            ].map(({ key, placeholder }) => (
              <input key={key} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
            ))}
          </div>

          {isLawFirm && (
            <>
              {/* Practice categories */}
              <div>
                <p className={`text-xs font-bold mb-2 ${sub}`}>Practice Categories</p>
                <div className="flex gap-2 flex-wrap">
                  {LEGAL_CATEGORIES.map(cat => (
                    <CategoryCheckbox key={cat} cat={cat} checked={(form.practice_categories || []).includes(cat)} onChange={toggleCat} dark={dark} />
                  ))}
                </div>
              </div>

              {/* Attorney-specific fields */}
              <div className="grid grid-cols-2 gap-3">
                <input value={form.bar_states || ""} onChange={e => setForm(f => ({ ...f, bar_states: e.target.value }))}
                  placeholder="Bar Admitted States (e.g. NY, NJ, FL)" className={`col-span-2 rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
                <input value={form.languages || ""} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                  placeholder="Languages (e.g. English, Spanish)" className={`rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
                <input value={form.availability || ""} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                  placeholder="Availability (e.g. Mon–Fri 9am–5pm)" className={`rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
                <input value={form.office_address || ""} onChange={e => setForm(f => ({ ...f, office_address: e.target.value }))}
                  placeholder="Office Address" className={`col-span-2 rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
              </div>

              {/* Practice areas */}
              <input value={form.practice_areas || ""} onChange={e => setForm(f => ({ ...f, practice_areas: e.target.value }))}
                placeholder="Practice areas / services (comma-separated)"
                className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />

              {/* Bio, education, experience, awards */}
              {[
                { key: "bio", placeholder: "Bio / About", rows: 2 },
                { key: "education", placeholder: "Education (e.g. JD – NYU Law, 2010)", rows: 2 },
                { key: "experience", placeholder: "Experience highlights", rows: 2 },
                { key: "awards", placeholder: "Awards, honors, bar memberships", rows: 2 },
              ].map(({ key, placeholder, rows }) => (
                <textarea key={key} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} rows={rows}
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none transition-colors ${input}`} />
              ))}
            </>
          )}

          {!isLawFirm && (
            <>
              <input value={form.practice_areas || ""} onChange={e => setForm(f => ({ ...f, practice_areas: e.target.value }))}
                placeholder="Specialties / Skills (comma-separated)"
                className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors ${input}`} />
              <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Short bio…" rows={2}
                className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none transition-colors ${input}`} />
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
              className="rounded-xl gap-1.5 font-bold text-white flex-1" style={{ background: "#0B2E6B" }}>
              <Check className="w-3.5 h-3.5" /> {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {/* Members list */}
      {isLoading ? (
        <div className={`text-center py-10 text-sm ${sub}`}>Loading…</div>
      ) : members.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <User className={`w-10 h-10 mx-auto mb-3 ${dark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-semibold text-sm ${sub}`}>No {memberLabel.toLowerCase()}s yet</p>
          <p className={`text-xs mt-1 mb-4 ${dark ? "text-white/30" : "text-slate-400"}`}>Add your first {memberLabel.toLowerCase()} to get started.</p>
          <Button size="sm" onClick={openNew} className="rounded-xl gap-1.5 font-bold text-white" style={{ background: "#0B2E6B" }}>
            <Plus className="w-3.5 h-3.5" /> Add {memberLabel}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map(m => {
            const cats = m.practice_categories || [];
            const catColors = { Immigration: "#0B2E6B", Civil: "#7c3aed", Criminal: "#b91c1c" };
            return (
              <div key={m.id} className={`rounded-2xl border p-4 flex gap-3 ${card}`}>
                {m.photo
                  ? <img src={m.photo} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-400/30" alt="" />
                  : <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-lg" style={{ background: "#0B2E6B" }}>{m.name?.charAt(0)}</div>
                }
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`font-bold text-sm truncate ${head}`}>{m.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${m.status === "active" ? (dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700") : (dark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")}`}>
                      {m.status}
                    </span>
                  </div>
                  {m.role && <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: "#FF7A00" }}>{m.role}</p>}
                  {cats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cats.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: catColors[c] || "#0B2E6B" }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {m.bar_states && <p className={`text-[11px] mt-1 ${sub}`}>⚖️ Bar: {m.bar_states}</p>}
                  {m.languages && <p className={`text-[11px] ${sub}`}>🗣 {m.languages}</p>}
                  <div className={`flex items-center gap-2 mt-1 text-[11px] ${sub}`}>
                    {m.email && <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3" /> {m.email}</span>}
                    {m.phone && <span className="flex items-center gap-0.5 flex-shrink-0"><Phone className="w-3 h-3" /> {m.phone}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm("Remove member?")) deleteMutation.mutate(m.id); }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}