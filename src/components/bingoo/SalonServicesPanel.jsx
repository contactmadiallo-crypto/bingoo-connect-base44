import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, X, Check, Image, Scissors, PackageOpen, Clock, Tag } from "lucide-react";
import { toast } from "sonner";
import { dbOp, logInvalidate } from "@/lib/dbDebug";

const EMPTY_SERVICE = {
  name: "", category: "", description: "",
  duration_minutes: 30, price: 0, price_label: "", image_url: "", is_active: true, order: 0
};

// ── Service Form — defined OUTSIDE the panel so it never remounts on re-render
function ServiceForm({ form, setForm, editingId, onSave, onCancel, isSaving, isDark, uploading, onImageUpload, businessMode }) {
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";
  const labelCls = `block text-xs font-semibold mb-1.5 ${mutedText}`;
  const inputCls = isDark
    ? "bg-[#1a2235] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1623] border-white/10" : "bg-white border-slate-200"}`}
      style={{ boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.08)" }}>

      {/* Form header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/8 bg-white/3" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            {businessMode ? <PackageOpen className="w-3.5 h-3.5 text-white" /> : <Scissors className="w-3.5 h-3.5 text-white" />}
          </div>
          <h3 className={`font-bold text-sm ${headText}`}>
            {editingId === "new" ? (businessMode ? "New Service or Product" : "New Salon Service") : (businessMode ? "Edit Service or Product" : "Edit Salon Service")}
          </h3>
        </div>
        <button onClick={onCancel} aria-label="Close"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-600"}`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Row 1: Name + Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{businessMode ? "Service or Product Name" : "Salon Service Name"} <span className="text-red-500">*</span></label>
            <Input
              className={inputCls}
              placeholder={businessMode ? "e.g. Consultation, Catering Package, Product" : "e.g. Full Haircut"}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <Input
              className={inputCls}
              placeholder={businessMode ? "e.g. Services, Products, Packages" : "e.g. Hair, Nails, Skin"}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            />
          </div>
        </div>

        {/* Row 2: Price Label + Duration */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Price</span>
            </label>
            <Input
              className={inputCls}
              placeholder='e.g. $25 or "From $30"'
              value={form.price_label}
              onChange={e => setForm(f => ({ ...f, price_label: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration {businessMode ? "(optional)" : "(minutes)"}</span>
            </label>
            <Input
              className={inputCls}
              type="number"
              min="5"
              placeholder="30"
              value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description <span className={mutedText + " font-normal"}>(optional)</span></label>
          <Textarea
            className={inputCls}
            placeholder={businessMode ? "Describe this service, product, or package..." : "Brief description of this salon service..."}
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Image upload */}
        <div>
          <label className={labelCls}>{businessMode ? "Item Image" : "Service Image"} <span className={mutedText + " font-normal"}>(optional)</span></label>
          <div className="flex items-center gap-3">
            {form.image_url
              ? <img src={form.image_url} className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0" alt="" />
              : <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xl flex-shrink-0 ${isDark ? "border-white/15 text-white/20" : "border-slate-200 text-slate-300"}`}>🖼️</div>
            }
            <div className="flex gap-2">
              <label className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors ${isDark ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                {uploading
                  ? <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  : <><Image className="w-3.5 h-3.5" /> {form.image_url ? "Change" : "Upload"}</>
                }
                <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={uploading} />
              </label>
              {form.image_url && (
                <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-3 pt-1 border-t ${isDark ? "border-white/8" : "border-slate-100"}`}>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5">
            <Check className="w-4 h-4" />
            {isSaving ? "Saving…" : (businessMode ? "Save Item" : "Save Salon Service")}
          </Button>
          <button onClick={onCancel}
            className={`text-sm font-semibold transition-colors ${isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-600"}`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main panel
export default function SalonServicesPanel({ profileId, isDark, onSaved, mode = "salon" }) {
  const businessMode = mode === "business";
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [uploading, setUploading] = useState(false);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBg = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100";

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["salon-services", profileId],
    queryFn: async () => {
      const result = await base44.entities.SalonService.filter({ profile_id: profileId }, "order", 100);
      return result || [];
    },
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const refetchServices = () => qc.refetchQueries({ queryKey: ["salon-services", profileId] });

  const createService = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('createGatedRecord', {
        entity_name: 'SalonService', profile_id: profileId, data,
      });
      return res.data.record;
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ["salon-services", profileId] });
      const prev = qc.getQueryData(["salon-services", profileId]);
      const tempId = `temp-${Date.now()}`;
      const optimistic = { ...data, id: tempId, profile_id: profileId, created_date: new Date().toISOString() };
      qc.setQueryData(["salon-services", profileId], (old = []) => [...old, optimistic]);
      return { prev, tempId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["salon-services", profileId], ctx.prev);
      const msg = _err?.response?.data?.error || _err?.message || "Permission denied";
      toast.error("Failed to save: " + msg);
    },
    onSuccess: (newRecord, _vars, ctx) => {
      qc.setQueryData(["salon-services", profileId], (old = []) =>
        old.map(s => s.id === ctx?.tempId ? newRecord : s));
      qc.invalidateQueries({ queryKey: ["salon-services", profileId] });
      toast.success("Saved Successfully");
      setEditingId(null);
      setForm(EMPTY_SERVICE);
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }) => dbOp("SalonService", "update", profileId,
      async () => {
        const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'SalonService', profile_id: profileId, op: 'update', record_id: id, data });
        return res.data.record;
      }),
    onSuccess: (updatedRecord) => {
      qc.setQueryData(["salon-services", profileId], (old = []) =>
        old.map(s => s.id === updatedRecord.id ? updatedRecord : s));
      qc.invalidateQueries({ queryKey: ["salon-services", profileId] });
      toast.success("Saved Successfully");
      setEditingId(null);
    },
    onError: (err) => toast.error("Failed to update: " + (err?.message || "Permission denied")),
  });

  const deleteService = useMutation({
    mutationFn: (id) => dbOp("SalonService", "delete", profileId,
      async () => {
        const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'SalonService', profile_id: profileId, op: 'delete', record_id: id });
        return res.data.record;
      }),
    onMutate: async (deletedId) => {
      await qc.cancelQueries({ queryKey: ["salon-services", profileId] });
      const prev = qc.getQueryData(["salon-services", profileId]);
      qc.setQueryData(["salon-services", profileId], (old = []) => old.filter(s => s.id !== deletedId));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["salon-services", profileId], ctx.prev);
      toast.error("Failed to delete service");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["salon-services", profileId] });
      toast.success("Service removed");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const startEdit = (service) => { setEditingId(service.id); setForm({ ...service }); };
  const startNew = () => { setEditingId("new"); setForm(EMPTY_SERVICE); };
  const handleCancel = () => setEditingId(null);

  const handleSave = () => {
    if (!form.name.trim()) { toast.error(businessMode ? "Service or product name is required" : "Salon service name is required"); return; }
    if (editingId === "new") {
      createService.mutate(form);
    } else {
      updateService.mutate({ id: editingId, data: form });
    }
  };

  const categories = [...new Set(services.map(s => s.category || "General"))];

  if (!profileId) {
    return (
      <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
        {businessMode ? <PackageOpen className={`w-10 h-10 mx-auto mb-2 ${mutedText}`} /> : <Scissors className={`w-10 h-10 mx-auto mb-2 ${mutedText}`} />}
        <p className={`text-sm ${mutedText}`}>Select a profile first to manage {businessMode ? "services and products" : "salon services"}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-black text-lg ${headText}`}>{businessMode ? "📦 Services & Product Showcase" : "✂️ Salon Service Menu"}</h2>
          <p className={`text-xs mt-0.5 ${mutedText}`}>{businessMode ? "Showcase your services, products, and packages on your public business profile." : "Add salon services for clients to browse and book."}</p>
        </div>
        {editingId !== "new" && (
          <Button onClick={startNew} size="sm" className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4" /> {businessMode ? "Add Item" : "Add Salon Service"}
          </Button>
        )}
      </div>

      {/* New service form */}
      {editingId === "new" && (
        <ServiceForm
          form={form} setForm={setForm} editingId={editingId}
          onSave={handleSave} onCancel={handleCancel}
          isSaving={createService.isPending}
          isDark={isDark} uploading={uploading} onImageUpload={handleImageUpload} businessMode={businessMode}
        />
      )}

      {/* Services list */}
      {isLoading ? (
        <div className={`text-center py-10 ${mutedText}`}>Loading…</div>
      ) : services.length === 0 && editingId !== "new" ? (
        <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
          {businessMode ? <PackageOpen className="w-10 h-10 mx-auto mb-3 opacity-20" /> : <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" />}
          <p className={`font-semibold text-sm ${headText}`}>{businessMode ? "No services or products yet" : "No salon services yet"}</p>
          <p className={`text-xs mt-1 mb-4 ${mutedText}`}>Add your first {businessMode ? "item" : "salon service"} to show on your profile</p>
          <Button onClick={startNew} size="sm" className="gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4" /> {businessMode ? "Add First Item" : "Add First Salon Service"}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map(cat => (
            <div key={cat}>
              <p className={`text-xs font-black uppercase tracking-widest mb-2 px-1 ${mutedText}`}>{cat}</p>
              <div className="space-y-2">
                {services.filter(s => (s.category || "General") === cat).map(service => (
                  <div key={service.id}>
                    {editingId === service.id ? (
                      <ServiceForm
                        form={form} setForm={setForm} editingId={editingId}
                        onSave={handleSave} onCancel={handleCancel}
                        isSaving={updateService.isPending}
                        isDark={isDark} uploading={uploading} onImageUpload={handleImageUpload} businessMode={businessMode}
                      />
                    ) : (
                      <div className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${cardBg}`}
                        style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
                        {service.image_url
                          ? <img src={service.image_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
                          : <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isDark ? "bg-white/8" : "bg-slate-100"}`}>{businessMode ? "📦" : "✂️"}</div>
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
                          <button onClick={() => startEdit(service)} aria-label="Edit service"
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteService.mutate(service.id)} aria-label="Delete service"
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors ${isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
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

      <a href="/shop?category=stands"
        className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'rgba(11,33,73,0.04)', borderColor: 'rgba(11,33,73,0.12)', color: '#0b2149' }}>
        <span>Order a countertop NFC stand for your salon</span>
        <span style={{ color: '#f97316' }}>Shop →</span>
      </a>
    </div>
  );
}