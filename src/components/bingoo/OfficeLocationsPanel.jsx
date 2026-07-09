import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { dbOp, logInvalidate } from "@/lib/dbDebug";

export default function OfficeLocationsPanel({ profileId, isDark, onSaved }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip_code: "", phone: "", email: "", hours: "", is_primary: false });
  const [deleteTarget, setDeleteTarget] = useState(null);

  console.log("[OfficeLocationsPanel] PANEL LOAD — profileId:", profileId);

  const { data: locations = [] } = useQuery({
    queryKey: ["office-locations", profileId],
    queryFn: async () => {
      console.log("[OfficeLocationsPanel] QUERY EXECUTED — profileId:", profileId);
      const result = await base44.entities.OfficeLocation.filter({ profile_id: profileId }, "order");
      console.log("[OfficeLocationsPanel] ROWS RETURNED:", result.length);
      return result;
    },
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const refetchLocations = () => qc.refetchQueries({ queryKey: ["office-locations", profileId] });

  const createMutation = useMutation({
    mutationFn: (data) => dbOp("OfficeLocation", "create", profileId,
      async () => {
        // Server-side plan entitlement check — free/unentitled plans are rejected even via direct API calls.
        const res = await base44.functions.invoke('createGatedRecord', {
          entity_name: 'OfficeLocation', profile_id: profileId, data,
        });
        return res.data.record;
      }),
    onSuccess: (newRecord) => {
      qc.setQueryData(["office-locations", profileId], (old = []) => [...old, newRecord]);
      qc.invalidateQueries({ queryKey: ["office-locations", profileId] });
      setForm({ name: "", address: "", city: "", state: "", zip_code: "", phone: "", email: "", hours: "", is_primary: false });
      setShowForm(false);
      toast.success("Saved Successfully");
    },
    onError: (err) => {
      console.error("Create error:", err);
      toast.error(`Failed to add: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => dbOp("OfficeLocation", "update", profileId,
      () => base44.entities.OfficeLocation.update(editId, data)),
    onSuccess: (updatedRecord) => {
      qc.setQueryData(["office-locations", profileId], (old = []) =>
        old.map(l => l.id === updatedRecord.id ? updatedRecord : l));
      qc.invalidateQueries({ queryKey: ["office-locations", profileId] });
      setForm({ name: "", address: "", city: "", state: "", zip_code: "", phone: "", email: "", hours: "", is_primary: false });
      setEditId(null);
      setShowForm(false);
      toast.success("Saved Successfully");
    },
    onError: (err) => {
      console.error("[OfficeLocationsPanel] Update error:", err);
      toast.error(`Failed to update: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dbOp("OfficeLocation", "delete", profileId,
      () => base44.entities.OfficeLocation.delete(id)),
    onSuccess: (_, deletedId) => {
      qc.setQueryData(["office-locations", profileId], (old = []) => old.filter(l => l.id !== deletedId));
      qc.invalidateQueries({ queryKey: ["office-locations", profileId] });
      toast.success("Location deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return toast.error("Name and address required");
    if (editId) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (loc) => {
    setEditId(loc.id);
    setForm({ name: loc.name, address: loc.address, city: loc.city || "", state: loc.state || "", zip_code: loc.zip_code || "", phone: loc.phone || "", email: loc.email || "", hours: loc.hours || "", is_primary: loc.is_primary || false });
    setShowForm(true);
  };

  const card = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-white/50" : "text-slate-500";
  const inp = isDark ? "bg-[#1a2235] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>Office Locations</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{locations.length} locations</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditId(null); setForm({ name: "", address: "", city: "", state: "", zip_code: "", phone: "", email: "", hours: "", is_primary: false }); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Location
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Office Name *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Main Office" className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Street Address *</label>
                <input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main Street" className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              </div>
              <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="City" className={`px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              <input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="State" maxLength="2" className={`px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              <input value={form.zip_code} onChange={(e) => setForm(f => ({ ...f, zip_code: e.target.value }))}
                placeholder="ZIP" className={`px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Phone" className={`px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email" type="email" className={`px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              <div className="col-span-2">
                <label className={`text-xs font-bold block mb-1.5 ${sub}`}>Hours</label>
                <input value={form.hours} onChange={(e) => setForm(f => ({ ...f, hours: e.target.value }))}
                  placeholder="e.g., Mon-Fri 9AM-5PM" className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
              </div>
              <label className={`col-span-2 flex items-center gap-2 cursor-pointer ${sub}`}>
                <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm(f => ({ ...f, is_primary: e.target.checked }))}
                  className="rounded" />
                <span className="text-xs font-semibold">Mark as primary location</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                {editId ? "Update" : "Create"}
              </Button>
              <Button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                variant="outline" className={`flex-1 rounded-xl ${isDark ? "border-white/15 text-white/60 hover:bg-white/10" : ""}`}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {locations.length === 0 && !showForm && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>No office locations yet.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {locations.map(loc => (
          <div key={loc.id} className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 flex-shrink-0 ${loc.is_primary ? "text-blue-600" : sub}`} style={loc.is_primary ? { color: "#0b2149" } : {}} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-sm ${head}`}>{loc.name}</p>
                  {loc.is_primary && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>Primary</span>}
                </div>
                <p className={`text-xs mt-0.5 ${sub}`}>{loc.address}</p>
                {(loc.city || loc.state) && <p className={`text-xs ${sub}`}>{loc.city}, {loc.state} {loc.zip_code}</p>}
                <div className={`flex gap-3 mt-2 text-xs ${sub} flex-wrap`}>
                  {loc.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {loc.phone}</span>}
                  {loc.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {loc.email}</span>}
                </div>
                {loc.hours && <p className={`text-xs mt-1 ${sub}`}>Hours: {loc.hours}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => startEdit(loc)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(loc.id)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this location?"
        description="This action cannot be undone."
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}