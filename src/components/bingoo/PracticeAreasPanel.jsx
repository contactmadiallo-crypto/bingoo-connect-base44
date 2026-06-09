import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { dbOp, logInvalidate } from "@/lib/dbDebug";

const PRACTICE_AREA_EMOJIS = ["⚖️", "🌎", "🔒", "👨‍👩‍👧‍👦", "🏠", "💼", "💰", "📋", "🚗", "📄"];

export default function PracticeAreasPanel({ profileId, isDark, onSaved }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "⚖️" });

  const RENDER_KEY = ["practice-areas", profileId];
  console.log(`%c[PA-RENDER] ── RENDER ── profileId=${JSON.stringify(profileId)} type=${typeof profileId} key=${JSON.stringify(RENDER_KEY)}`, "color:purple;font-weight:bold");

  const { data: areas = [], isFetching } = useQuery({
    queryKey: ["practice-areas", profileId],
    queryFn: async () => {
      console.log(`%c[PA-QUERY] FETCH EXECUTING — profileId=${JSON.stringify(profileId)}`, "color:blue;font-weight:bold");
      const result = await base44.entities.PracticeArea.filter({ profile_id: profileId }, "order");
      console.log(`%c[PA-QUERY] DB RETURNED ${result.length} rows:`, "color:blue", result.map(a => ({ id: a.id, name: a.name })));
      return result;
    },
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  console.log(`%c[PA-RENDER] areas.length=${areas.length} | isFetching=${isFetching}`, "color:purple");

  if (!profileId) console.warn("%c[PA-WARN] QUERY DISABLED — no profileId passed as prop", "color:red;font-weight:bold");

  const refetchAreas = () => qc.refetchQueries({ queryKey: ["practice-areas", profileId] });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { profile_id: profileId, ...data };

      // ── LIVE SESSION COMPARISON ──
      let me = null;
      try { me = await base44.auth.me(); } catch(e) { console.error("[PA-AUTH] Failed to fetch me():", e); }

      const ownedIds = me?.owned_profile_ids ?? null;
      const payloadProfileId = payload.profile_id;
      const includesResult = Array.isArray(ownedIds) ? ownedIds.includes(payloadProfileId) : false;

      console.log("%c[PA-RLS-CHECK] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:red;font-weight:bold;font-size:13px");
      console.log("%cowned_profile_ids:", "font-weight:bold", JSON.stringify(ownedIds));
      console.log("%cpayload.profile_id:", "font-weight:bold", JSON.stringify(payloadProfileId));
      console.log("%ctypeof payload.profile_id:", "font-weight:bold", typeof payloadProfileId);
      console.log("%cincludes() result:", "font-weight:bold", includesResult);
      console.log("%cuser.id:", "font-weight:bold", me?.id);
      console.log("%cuser.role:", "font-weight:bold", me?.role);
      if (Array.isArray(ownedIds)) {
        ownedIds.forEach((id, i) => {
          const match = id === payloadProfileId;
          console.log(`  [${i}] "${id}" (${typeof id}) === "${payloadProfileId}" (${typeof payloadProfileId}) → ${match}`);
        });
      }
      console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:red;font-weight:bold");

      return base44.entities.PracticeArea.create(payload);
    },
    onSuccess: (newRecord) => {
      const WRITE_KEY = ["practice-areas", profileId];
      console.log(`%c[PA-SUCCESS] ── MUTATION SUCCESS ──`, "color:green;font-weight:bold");
      console.log("[PA-SUCCESS] newRecord:", newRecord);
      console.log(`[PA-SUCCESS] writing to cache key: ${JSON.stringify(WRITE_KEY)}`);
      const before = qc.getQueryData(WRITE_KEY);
      console.log(`[PA-SUCCESS] cache BEFORE setQueryData:`, before, "length:", before?.length ?? "undefined/null");
      qc.setQueryData(WRITE_KEY, (old = []) => {
        const updated = [...old, newRecord];
        console.log(`%c[PA-CACHE] setQueryData called — old.length=${old.length} → new.length=${updated.length}`, "color:orange;font-weight:bold");
        return updated;
      });
      const after = qc.getQueryData(WRITE_KEY);
      console.log(`[PA-SUCCESS] cache AFTER setQueryData:`, after, "length:", after?.length ?? "undefined/null");
      console.log(`[PA-SUCCESS] RENDER_KEY used at render time was: ${JSON.stringify(RENDER_KEY)}`);
      console.log(`[PA-SUCCESS] WRITE_KEY used now: ${JSON.stringify(WRITE_KEY)}`);
      console.log(`[PA-SUCCESS] Keys match: ${JSON.stringify(RENDER_KEY) === JSON.stringify(WRITE_KEY)}`);
      qc.invalidateQueries({ queryKey: WRITE_KEY });
      setForm({ name: "", description: "", icon: "⚖️" });
      setShowForm(false);
      toast.success("Saved Successfully");
    },
    onError: (err) => {
      console.error("%c[PA-ERROR] ── MUTATION FAILED ──", "color:red;font-weight:bold", err);
      toast.error(`Failed to add: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => dbOp("PracticeArea", "update", profileId,
      () => base44.entities.PracticeArea.update(editId, data)),
    onSuccess: (updatedRecord) => {
      qc.setQueryData(["practice-areas", profileId], (old = []) =>
        old.map(a => a.id === updatedRecord.id ? updatedRecord : a));
      qc.invalidateQueries({ queryKey: ["practice-areas", profileId] });
      setForm({ name: "", description: "", icon: "⚖️" });
      setEditId(null);
      setShowForm(false);
      toast.success("Saved Successfully");
    },
    onError: (err) => {
      console.error("[PracticeAreasPanel] Update error:", err);
      toast.error(`Failed to update: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dbOp("PracticeArea", "delete", profileId,
      () => base44.entities.PracticeArea.delete(id)),
    onSuccess: (_, deletedId) => {
      qc.setQueryData(["practice-areas", profileId], (old = []) => old.filter(a => a.id !== deletedId));
      qc.invalidateQueries({ queryKey: ["practice-areas", profileId] });
      toast.success("Practice area deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`%c[PA-CLICK] ── SAVE CLICKED ── name="${form.name}" profileId=${JSON.stringify(profileId)} editId=${editId}`, "color:darkgreen;font-weight:bold;font-size:14px");
    if (!form.name.trim()) {
      console.warn("[PA-CLICK] VALIDATION FAILED — name is empty");
      return toast.error("Name required");
    }
    console.log("[PA-CLICK] VALIDATION PASSED");
    if (editId) {
      console.log("[PA-CLICK] → calling updateMutation");
      updateMutation.mutate(form);
    } else {
      console.log("[PA-CLICK] → calling createMutation");
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
        {console.log(`%c[PA-LIST] ── LIST RENDER ── areas.length=${areas.length} | ids=${JSON.stringify(areas.map(a=>a.id))}`, "color:darkorange;font-weight:bold")}
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