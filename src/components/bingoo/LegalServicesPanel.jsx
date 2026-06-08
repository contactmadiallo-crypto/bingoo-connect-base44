import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { LEGAL_CATEGORIES } from "@/lib/legalData";

const CATEGORY_COLORS = { Immigration: "#0369a1", Civil: "#7c3aed", Criminal: "#dc2626" };

export default function LegalServicesPanel({ profileId, isDark }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", legal_category: "Immigration" });

  const { data: services = [] } = useQuery({
    queryKey: ["legal-services", profileId],
    queryFn: () => base44.entities.LegalService.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LegalService.create({ profile_id: profileId, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      setForm({ name: "", description: "", legal_category: "Immigration" });
      setShowForm(false);
      toast.success("Service added");
      setTimeout(() => navigate(-1), 500);
    },
    onError: (err) => {
      console.error("Create error:", err);
      toast.error(`Failed to create: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LegalService.update(editId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      setForm({ name: "", description: "", legal_category: "Immigration" });
      setEditId(null);
      setShowForm(false);
      toast.success("Service updated");
      setTimeout(() => navigate(-1), 500);
    },
    onError: (err) => {
      console.error("Update error:", err);
      toast.error(`Failed to update: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LegalService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      toast.success("Service deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    if (editId) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (service) => {
    setEditId(service.id);
    setForm({ name: service.name, description: service.description || "", legal_category: service.legal_category || "Immigration" });
    setShowForm(true);
  };

  const servicesByCategory = LEGAL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.legal_category === cat);
    return acc;
  }, {});

  const card = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-white/50" : "text-slate-500";
  const inp = isDark ? "bg-white/8 border-white/15 text-white focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>Legal Services</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{services.length} services</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditId(null); setForm({ name: "", description: "", legal_category: "Immigration" }); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Category</label>
              <select value={form.legal_category} onChange={(e) => setForm(f => ({ ...f, legal_category: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`}>
                {LEGAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Service Name *</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Green Card Application" className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief service description…" rows={2}
                className={`w-full px-3 py-2 rounded-xl border outline-none resize-none transition-colors text-sm ${inp}`} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                {editId ? "Update" : "Create"}
              </Button>
              <Button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                variant="outline" className="flex-1 rounded-xl">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 && !showForm && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>No services yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {LEGAL_CATEGORIES.map(cat => {
          const catServices = servicesByCategory[cat];
          if (catServices.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${head}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                {cat}
              </h3>
              <div className="space-y-2">
                {catServices.map(service => (
                  <div key={service.id} className={`rounded-xl border p-3 flex items-start gap-3 ${card}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${head}`}>{service.name}</p>
                      {service.description && <p className={`text-xs mt-0.5 ${sub}`}>{service.description}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(service)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
                        Edit
                      </button>
                      <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(service.id); }}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}