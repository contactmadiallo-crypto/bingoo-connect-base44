import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

const PRACTICE_AREA_EMOJIS = ["⚖️", "🌎", "🔒", "👨‍👩‍👧‍👦", "🏠", "💼", "💰", "📋", "🚗", "📄"];

export default function PracticeAreasPanel({ profileId, isDark, onSaved }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "⚖️" });

  const { data: areas = [] } = useQuery({
    queryKey: ["practice-areas", profileId],
    queryFn: () => base44.entities.PracticeArea.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PracticeArea.create({ profile_id: profileId, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-areas", profileId] });
      setForm({ name: "", description: "", icon: "⚖️" });
      setShowForm(false);
      toast.success("Saved Successfully");
      onSaved?.();
    },
    onError: (err) => {
      console.error("Create error:", err);
      toast.error(`Failed to add: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PracticeArea.update(editId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-areas", profileId] });
      setForm({ name: "", description: "", icon: "⚖️" });
      setEditId(null);
      setShowForm(false);
      toast.success("Saved Successfully");
      onSaved?.();
    },
    onError: (err) => {
      console.error("Update error:", err);
      toast.error(`Failed to update: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PracticeArea.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["practice-areas", profileId] });
      toast.success("Practice area deleted");
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

  const startEdit = (area) => {
    setEditId(area.id);
    setForm({ name: area.name, description: area.description || "", icon: area.icon || "⚖️" });
    setShowForm(true);
  };

  const card = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-white/50" : "text-slate-500";
  const inp = isDark ? "bg-white/8 border-white/15 text-white focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>Practice Areas</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{areas.length} active areas</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditId(null); setForm({ name: "", description: "", icon: "⚖️" }); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Area
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <p className={`text-xs font-bold mb-1.5 ${sub}`}>Icon</p>
              <div className="flex gap-1.5 flex-wrap">
                {PRACTICE_AREA_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setForm(f => ({ ...f, icon: e }))}
                    className={`w-10 h-10 rounded-lg text-xl transition-all ${form.icon === e ? (isDark ? "bg-blue-500/30 border-blue-400" : "bg-blue-100 border-blue-400") : (isDark ? "bg-white/8 border-white/15" : "bg-slate-100 border-slate-200")} border`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Name *</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Immigration Law" className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this practice area…" rows={2}
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

      {areas.length === 0 && !showForm && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>No practice areas yet.</p>
          <p className={`text-xs mt-1 ${sub}`}>Add your first practice area to get started.</p>
        </div>
      )}

      <div className="space-y-2">
        {areas.map(area => (
          <div key={area.id} className={`rounded-2xl border p-4 flex items-center gap-3 ${card}`}>
            <GripVertical className={`w-4 h-4 flex-shrink-0 ${sub}`} />
            <span className="text-2xl">{area.icon || "⚖️"}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${head}`}>{area.name}</p>
              {area.description && <p className={`text-xs mt-0.5 ${sub}`}>{area.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(area)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
                Edit
              </button>
              <button onClick={() => { if (confirm("Delete this practice area?")) deleteMutation.mutate(area.id); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}