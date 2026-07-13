import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, Briefcase, Image } from "lucide-react";
import { toast } from "sonner";
import PortfolioComments from "./PortfolioComments";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const EMPTY = { title: "", description: "", image_url: "", link: "", category: "" };

export default function PortfolioPanel({ profileId, user }) {
  const qc = useQueryClient();
  const { isDark } = useBingooTheme();
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio", profileId],
    queryFn: () => base44.entities.PortfolioItem.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('createGatedRecord', {
        entity_name: 'PortfolioItem', profile_id: profileId,
        data: { ...form, order: items.length },
      });
      return res.data.record;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["portfolio", profileId] }); setForm(EMPTY); setAdding(false); toast.success("Item added!"); },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.message || "Permission denied";
      toast.error("Failed to add: " + msg);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.PortfolioItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio", profileId] }),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Theme-aware classes
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-500";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const formBg = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";
  const inputClass = isDark
    ? "bg-[#1a2235] border-white/10 text-white placeholder:text-white/30"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400";
  const labelClass = isDark ? "text-white/60" : "text-slate-600";
  const cancelBtnClass = isDark
    ? "border-white/10 text-white/50 hover:text-white hover:bg-white/10"
    : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50";

  if (!profileId) return (
    <div className={`text-center py-12 ${mutedText}`}>Create a profile first.</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${headText}`}>Portfolio</h2>
          <p className={`text-sm mt-0.5 ${mutedText}`}>Showcase your work to profile visitors</p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: formBg, border: `1px solid ${cardBorder}` }}>
          <h3 className={`font-bold ${headText}`}>New Portfolio Item</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={labelClass}>Title *</Label>
              <Input className={`mt-1 ${inputClass}`} placeholder="Project name" value={form.title} onChange={set("title")} />
            </div>
            <div>
              <Label className={labelClass}>Category</Label>
              <Input className={`mt-1 ${inputClass}`} placeholder="Design, Dev, Photography..." value={form.category} onChange={set("category")} />
            </div>
          </div>
          <div>
            <Label className={labelClass}>Description</Label>
            <Textarea className={`mt-1 ${inputClass}`} placeholder="Brief description..." value={form.description} onChange={set("description")} rows={2} />
          </div>
          <div>
            <Label className={labelClass}>External Link</Label>
            <Input className={`mt-1 ${inputClass}`} placeholder="https://..." value={form.link} onChange={set("link")} />
          </div>
          <div>
            <Label className={labelClass}>Cover Image</Label>
            <div className="flex items-center gap-3 mt-1">
              {form.image_url && <img src={form.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />}
              <label className="cursor-pointer text-xs font-semibold text-blue-500 hover:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
                {uploading ? <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><Image className="w-3.5 h-3.5" />Upload Image</>}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setAdding(false); setForm(EMPTY); }} className={cancelBtnClass}>Cancel</Button>
            <Button disabled={!form.title || create.isPending} onClick={() => create.mutate()} className="bg-blue-600 hover:bg-blue-500 text-white">
              {create.isPending ? "Saving..." : "Add to Portfolio"}
            </Button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: `1px dashed ${cardBorder}` }}>
          <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-white/10" : "text-slate-300"}`} />
          <p className={`font-semibold ${isDark ? "text-white/40" : "text-slate-500"}`}>No portfolio items yet</p>
          <p className={`text-sm mt-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>Add your first project, design, or work sample.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="group rounded-2xl overflow-hidden flex flex-col"
              style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)" }}>
              {/* Image */}
              <div className="relative aspect-video w-full overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center text-4xl ${isDark ? "bg-white/5 opacity-30" : "bg-slate-100"}`}>🖼️</div>
                }
                <button onClick={() => remove.mutate(item.id)} aria-label="Delete portfolio item"
                  className="absolute top-2 right-2 w-11 h-11 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Open external link"
                    className="absolute top-2 left-2 w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {/* Info + comments */}
              <div className="p-3 flex-1 flex flex-col">
                <p className={`font-bold text-xs ${headText}`}>{item.title}</p>
                {item.category && <p className={`text-xs mt-0.5 ${mutedText}`}>{item.category}</p>}
                {item.description && <p className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-white/30" : "text-slate-400"}`}>{item.description}</p>}
                <div className="mt-auto">
                  <PortfolioComments itemId={item.id} user={user} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}