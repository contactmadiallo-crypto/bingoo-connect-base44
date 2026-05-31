import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, Briefcase, Image } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { title: "", description: "", image_url: "", link: "", category: "" };

export default function PortfolioPanel({ profileId }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio", profileId],
    queryFn: () => base44.entities.PortfolioItem.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
  });

  const create = useMutation({
    mutationFn: () => base44.entities.PortfolioItem.create({ ...form, profile_id: profileId, order: items.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["portfolio", profileId] }); setForm(EMPTY); setAdding(false); toast.success("Item added!"); },
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

  if (!profileId) return <div className="text-center py-12 text-white/30">Create a profile first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Portfolio</h2>
          <p className="text-white/30 text-sm mt-0.5">Showcase your work to profile visitors</p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="bg-blue-600 hover:bg-blue-500 gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="font-bold text-white">New Portfolio Item</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60">Title *</Label>
              <Input className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="Project name" value={form.title} onChange={set("title")} />
            </div>
            <div>
              <Label className="text-white/60">Category</Label>
              <Input className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="Design, Dev, Photography..." value={form.category} onChange={set("category")} />
            </div>
          </div>
          <div>
            <Label className="text-white/60">Description</Label>
            <Textarea className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="Brief description..." value={form.description} onChange={set("description")} rows={2} />
          </div>
          <div>
            <Label className="text-white/60">External Link</Label>
            <Input className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="https://..." value={form.link} onChange={set("link")} />
          </div>
          <div>
            <Label className="text-white/60">Cover Image</Label>
            <div className="flex items-center gap-3 mt-1">
              {form.image_url && <img src={form.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />}
              <label className="cursor-pointer text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
                {uploading ? <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><Image className="w-3.5 h-3.5" />Upload Image</>}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setAdding(false); setForm(EMPTY); }} className="border-white/10 text-white/50 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button disabled={!form.title || create.isPending} onClick={() => create.mutate()} className="bg-blue-600 hover:bg-blue-500">
              {create.isPending ? "Saving..." : "Add to Portfolio"}
            </Button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <Briefcase className="w-12 h-12 mx-auto text-white/10 mb-4" />
          <p className="font-semibold text-white/40">No portfolio items yet</p>
          <p className="text-white/20 text-sm mt-1">Add your first project, design, or work sample.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">🖼️</div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <p className="text-white font-bold text-xs">{item.title}</p>
                {item.category && <p className="text-white/50 text-[10px]">{item.category}</p>}
              </div>
              <button onClick={() => remove.mutate(item.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}