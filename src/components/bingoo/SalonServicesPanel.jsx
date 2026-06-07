import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, X, Check, Image, Scissors } from "lucide-react";
import { toast } from "sonner";

const EMPTY_SERVICE = {
  name: "", category: "", description: "",
  duration_minutes: 30, price: 0, price_label: "", image_url: "", is_active: true, order: 0
};

export default function SalonServicesPanel({ profileId, isDark }) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null); // null=none, "new"=creating
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [uploading, setUploading] = useState(false);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBg = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100";
  const inputStyle = isDark
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/25"
    : "border-slate-200";

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["salon-services", profileId],
    queryFn: () => base44.entities.SalonService.filter({ profile_id: profileId }, "order", 100),
    enabled: !!profileId,
  });

  const createService = useMutation({
    mutationFn: (data) => base44.entities.SalonService.create({ ...data, profile_id: profileId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salon-services", profileId] }); toast.success("Service added!"); setEditingId(null); setForm(EMPTY_SERVICE); },
    onError: () => toast.error("Failed to save service"),
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SalonService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salon-services", profileId] }); toast.success("Service updated!"); setEditingId(null); },
  });

  const deleteService = useMutation({
    mutationFn: (id) => base44.entities.SalonService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salon-services", profileId] }); toast.success("Service removed"); },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setForm({ ...service });
  };

  const startNew = () => {
    setEditingId("new");
    setForm(EMPTY_SERVICE);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Service name is required"); return; }
    if (editingId === "new") {
      createService.mutate(form);
    } else {
      updateService.mutate({ id: editingId, data: form });
    }
  };

  // Group by category
  const categories = [...new Set(services.map(s => s.category || "General"))];

  const ServiceForm = () => (
    <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? "bg-white/8 border-white/12" : "bg-blue-50 border-blue-200"}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-bold text-sm ${headText}`}>{editingId === "new" ? "Add New Service" : "Edit Service"}</h3>
        <button onClick={() => setEditingId(null)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-200 text-slate-400"}`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className={`text-xs font-bold mb-1 ${mutedText}`}>Service Name *</Label>
          <Input className={`${inputStyle} mt-1`} placeholder="e.g. Full Haircut" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label className={`text-xs font-bold mb-1 ${mutedText}`}>Category</Label>
          <Input className={`${inputStyle} mt-1`} placeholder="e.g. Hair, Nails, Skin" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
        </div>
        <div>
          <Label className={`text-xs font-bold mb-1 ${mutedText}`}>Price Label</Label>
          <Input className={`${inputStyle} mt-1`} placeholder='e.g. "$25" or "From $30"' value={form.price_label} onChange={e => setForm(f => ({ ...f, price_label: e.target.value }))} />
        </div>
        <div>
          <Label className={`text-xs font-bold mb-1 ${mutedText}`}>Duration (minutes)</Label>
          <Input className={`${inputStyle} mt-1`} type="number" placeholder="30" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
        </div>
      </div>

      <div>
        <Label className={`text-xs font-bold mb-1 ${mutedText}`}>Description (optional)</Label>
        <Textarea className={`${inputStyle} mt-1`} placeholder="Brief description of this service..." rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      {/* Service image */}
      <div>
        <Label className={`text-xs font-bold mb-2 ${mutedText}`}>Service Image (optional)</Label>
        <div className="flex items-center gap-3">
          {form.image_url
            ? <img src={form.image_url} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt="" />
            : <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-slate-300 text-xl ${isDark ? "border-white/15" : "border-slate-200"}`}>🖼️</div>
          }
          <label className="cursor-pointer text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
            {uploading ? <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><Image className="w-3.5 h-3.5" />{form.image_url ? "Change" : "Upload"}</>}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
          {form.image_url && <button onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-lg">Remove</button>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={handleSave} disabled={createService.isPending || updateService.isPending}
          className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white">
          <Check className="w-4 h-4" />
          {createService.isPending || updateService.isPending ? "Saving..." : "Save Service"}
        </Button>
        <button onClick={() => setEditingId(null)} className={`text-sm font-semibold ${mutedText} hover:text-slate-700`}>Cancel</button>
      </div>
    </div>
  );

  if (!profileId) {
    return (
      <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
        <Scissors className={`w-10 h-10 mx-auto mb-2 ${mutedText}`} />
        <p className={`text-sm ${mutedText}`}>Select a profile first to manage services.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-black text-lg ${headText}`}>✂️ Service Menu</h2>
          <p className={`text-xs mt-0.5 ${mutedText}`}>Add your salon services — they'll appear on your public profile</p>
        </div>
        {editingId !== "new" && (
          <Button onClick={startNew} size="sm" className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}
      </div>

      {/* New service form */}
      {editingId === "new" && <ServiceForm />}

      {/* Services list grouped by category */}
      {isLoading ? (
        <div className={`text-center py-10 ${mutedText}`}>Loading...</div>
      ) : services.length === 0 && editingId !== "new" ? (
        <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
          <Scissors className={`w-10 h-10 mx-auto mb-3 opacity-20`} />
          <p className={`font-semibold text-sm ${headText}`}>No services yet</p>
          <p className={`text-xs mt-1 mb-4 ${mutedText}`}>Add your first service to show on your profile</p>
          <Button onClick={startNew} size="sm" className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Add First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map(cat => (
            <div key={cat}>
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${mutedText}`}>{cat}</p>
              <div className="space-y-2">
                {services.filter(s => (s.category || "General") === cat).map(service => (
                  <div key={service.id}>
                    {editingId === service.id ? (
                      <ServiceForm />
                    ) : (
                      <div className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${cardBg}`}
                        style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
                        {service.image_url
                          ? <img src={service.image_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
                          : <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isDark ? "bg-white/8" : "bg-slate-100"}`}>✂️</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${headText}`}>{service.name}</p>
                          {service.description && <p className={`text-xs mt-0.5 truncate ${mutedText}`}>{service.description}</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            {service.price_label && <span className={`text-xs font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{service.price_label}</span>}
                            {service.duration_minutes && <span className={`text-xs ${mutedText}`}>⏱ {service.duration_minutes} min</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(service)}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteService.mutate(service.id)}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className={`text-xs ${mutedText} pt-2`}>
        💡 Services appear on your public profile. You can add unlimited services with photos.
      </p>
    </div>
  );
}