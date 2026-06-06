import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Edit2, Eye, Link2, Download, Trash2, Plus, CheckCircle, Globe, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const FIELD_LABELS = {
  display_name: "Full Name",
  job_title: "Job Title",
  company_name: "Company / Organization",
  bio: "Professional Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin_url: "LinkedIn URL",
  website: "Website",
};

function ResumeEditor({ resume, onClose, onSaved, profileId }) {
  const [form, setForm] = useState(resume || {
    display_name: "", job_title: "", company_name: "", bio: "", skills: "",
    experience: "", education: "", email: "", phone: "", location: "",
    linkedin_url: "", website: "", is_public: true, attached_to_profile: false,
  });
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const save = async () => {
    if (!form.display_name) return toast.error("Full name is required");
    setSaving(true);
    try {
      const data = { ...form };
      // Auto-link to profile when "Show on profile" is checked
      if (data.attached_to_profile && profileId) {
        data.profile_id = profileId;
      }
      if (resume?.id) {
        await base44.entities.Resume.update(resume.id, data);
      } else {
        await base44.entities.Resume.create({ ...data, source: "manual" });
      }
      qc.invalidateQueries({ queryKey: ["my-resumes"] });
      toast.success(resume?.id ? "Resume updated!" : "Resume created!");
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error("Failed to save resume");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-lg">{resume?.id ? "Edit Resume" : "New Resume"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
              {["bio", "skills", "experience", "education"].includes(key) ? (
                <textarea
                  rows={3}
                  value={form[key] || ""}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                />
              ) : (
                <input
                  value={form[key] || ""}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} className="rounded" />
              <span className="text-sm font-semibold text-slate-600">Public resume link</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.attached_to_profile} onChange={e => setForm(f => ({ ...f, attached_to_profile: e.target.checked, is_public: e.target.checked ? true : f.is_public }))} className="rounded" />
              <span className="text-sm font-semibold text-slate-600">Show on profile</span>
              {!profileId && form.attached_to_profile && <span className="text-xs text-amber-500">(select a profile first)</span>}
            </label>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl font-bold">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2">
            {saving ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResumeCard({ resume, onEdit, origin }) {
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const publicUrl = `${origin}/resume/${resume.id}`;

  const del = async () => {
    if (!confirm("Delete this resume?")) return;
    setDeleting(true);
    await base44.entities.Resume.delete(resume.id);
    qc.invalidateQueries({ queryKey: ["my-resumes"] });
    toast.success("Resume deleted");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied!");
  };

  const downloadPDF = () => {
    // Open in new tab for printing/saving as PDF
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${resume.display_name} - Resume</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
        h1 { font-size: 28px; font-weight: 900; margin: 0 0 4px; }
        .title { font-size: 16px; color: #3b82f6; font-weight: 700; margin: 0 0 16px; }
        .contact { display: flex; gap: 16px; font-size: 13px; color: #475569; margin-bottom: 24px; flex-wrap: wrap; }
        h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 10px; }
        p { font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 8px; white-space: pre-wrap; }
        @media print { body { margin: 0; padding: 12px; } }
      </style></head><body>
      <h1>${resume.display_name || ""}</h1>
      <p class="title">${resume.job_title || ""}${resume.company_name ? ` · ${resume.company_name}` : ""}</p>
      <div class="contact">
        ${resume.email ? `<span>📧 ${resume.email}</span>` : ""}
        ${resume.phone ? `<span>📞 ${resume.phone}</span>` : ""}
        ${resume.location ? `<span>📍 ${resume.location}</span>` : ""}
        ${resume.linkedin_url ? `<span>🔗 ${resume.linkedin_url}</span>` : ""}
        ${resume.website ? `<span>🌐 ${resume.website}</span>` : ""}
      </div>
      ${resume.bio ? `<h2>Summary</h2><p>${resume.bio}</p>` : ""}
      ${resume.skills ? `<h2>Skills</h2><p>${resume.skills}</p>` : ""}
      ${resume.experience ? `<h2>Experience</h2><p>${resume.experience}</p>` : ""}
      ${resume.education ? `<h2>Education</h2><p>${resume.education}</p>` : ""}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{resume.display_name}</p>
            <p className="text-xs text-slate-500">{resume.job_title}{resume.company_name ? ` · ${resume.company_name}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {resume.is_public
            ? <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold"><Globe className="w-3 h-3" /> Public</span>
            : <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full font-semibold"><EyeOff className="w-3 h-3" /> Private</span>
          }
          {resume.attached_to_profile && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold"><Link2 className="w-3 h-3" /> On Profile</span>
          )}
        </div>
      </div>

      {resume.bio && <p className="text-xs text-slate-500 line-clamp-2">{resume.bio}</p>}

      <div className="flex gap-2 flex-wrap pt-1">
        <Button size="sm" variant="outline" onClick={() => onEdit(resume)} className="gap-1.5 text-xs rounded-xl font-semibold">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </Button>
        {resume.is_public && (
          <>
            <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 text-xs rounded-xl font-semibold">
              <Link2 className="w-3.5 h-3.5" /> Copy Link
            </Button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl font-semibold">
                <ExternalLink className="w-3.5 h-3.5" /> View
              </Button>
            </a>
          </>
        )}
        <Button size="sm" variant="outline" onClick={downloadPDF} className="gap-1.5 text-xs rounded-xl font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
          <Download className="w-3.5 h-3.5" /> PDF
        </Button>
        <Button size="sm" variant="outline" onClick={del} disabled={deleting} className="gap-1.5 text-xs rounded-xl font-semibold text-red-500 border-red-200 hover:bg-red-50 ml-auto">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

export default function ResumePanel({ user, profileId }) {
  const [editingResume, setEditingResume] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const qc = useQueryClient();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => base44.entities.Resume.filter({ created_by_id: user?.id }, "-created_date"),
    enabled: !!user?.id,
  });

  const origin = window.location.origin;

  const openNew = () => { setEditingResume(null); setShowEditor(true); };
  const openEdit = (r) => { setEditingResume(r); setShowEditor(true); };
  const closeEditor = () => { setEditingResume(null); setShowEditor(false); };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">My Resumes</h2>
          <p className="text-sm text-slate-400 mt-0.5">Created by AI or manually — view, edit, share, download as PDF</p>
        </div>
        <Button onClick={openNew} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2">
          <Plus className="w-4 h-4" /> New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <FileText className="w-14 h-14 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600 text-lg">No resumes yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Use the AI Builder to generate one, or create manually.</p>
          <Button onClick={openNew} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> Create Resume
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map(r => (
            <ResumeCard key={r.id} resume={r} onEdit={openEdit} origin={origin} />
          ))}
        </div>
      )}

      {showEditor && (
        <ResumeEditor
          resume={editingResume}
          onClose={closeEditor}
          onSaved={() => qc.invalidateQueries({ queryKey: ["my-resumes"] })}
          profileId={profileId}
        />
      )}
    </div>
  );
}