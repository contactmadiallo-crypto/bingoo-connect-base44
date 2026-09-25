import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { LEGAL_CATEGORIES } from "@/lib/legalData";
import { MobileSelect } from "@/components/ui/mobile-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { dbOp } from "@/lib/dbDebug";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const CATEGORY_COLORS = { Immigration: "#0369a1", Civil: "#7c3aed", Criminal: "#dc2626" };

export default function LegalServicesPanel({ profileId, isDark, onSaved }) {
  const { language } = useI18n();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", legal_category: "Immigration" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: services = [] } = useQuery({
    queryKey: ["legal-services", profileId],
    queryFn: async () => {
      const result = await base44.entities.LegalService.filter({ profile_id: profileId }, "order");
      return result;
    },
    enabled: !!profileId,
    staleTime: 0,
    gcTime: 0,
  });

  const refetchServices = () => qc.refetchQueries({ queryKey: ["legal-services", profileId] });

  const createMutation = useMutation({
    mutationFn: (data) => dbOp("LegalService", "create", profileId,
      async () => {
        // Server-side plan entitlement check — free/unentitled plans are rejected even via direct API calls.
        const res = await base44.functions.invoke('createGatedRecord', {
          entity_name: 'LegalService', profile_id: profileId, data,
        });
        return res.data.record;
      }),
    onSuccess: (newRecord) => {
      qc.setQueryData(["legal-services", profileId], (old = []) => [...old, newRecord]);
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      setForm({ name: "", description: "", legal_category: "Immigration" });
      setShowForm(false);
      toast.success(t("legal_saved",language));
    },
    onError: (err) => {
      console.error("[LegalServicesPanel] Create error:", err);
      toast.error(`${t("legal_failed_add",language)}: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => dbOp("LegalService", "update", profileId,
      async () => {
        const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'LegalService', profile_id: profileId, op: 'update', record_id: editId, data });
        return res.data.record;
      }),
    onSuccess: (updatedRecord) => {
      qc.setQueryData(["legal-services", profileId], (old = []) =>
        old.map(s => s.id === updatedRecord.id ? updatedRecord : s));
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      setForm({ name: "", description: "", legal_category: "Immigration" });
      setEditId(null);
      setShowForm(false);
      toast.success(t("legal_saved",language));
    },
    onError: (err) => {
      console.error("[LegalServicesPanel] Update error:", err);
      toast.error(`${t("legal_failed_update",language)}: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dbOp("LegalService", "delete", profileId,
      async () => {
        const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'LegalService', profile_id: profileId, op: 'delete', record_id: id });
        return res.data.record;
      }),
    onSuccess: (_, deletedId) => {
      qc.setQueryData(["legal-services", profileId], (old = []) => old.filter(s => s.id !== deletedId));
      qc.invalidateQueries({ queryKey: ["legal-services", profileId] });
      toast.success(t("legal_service_deleted",language));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t("legal_name_required",language));
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
  const inp = isDark ? "bg-[#1a2235] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black ${head}`}>{t("legal_services_title",language)}</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{services.length} {t("legal_services_count",language)}</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditId(null); setForm({ name: "", description: "", legal_category: "Immigration" }); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" /> {t("legal_services_add",language)}
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>{t("legal_category",language)}</label>
              <MobileSelect
                value={form.legal_category}
                onValueChange={(v) => setForm(f => ({ ...f, legal_category: v }))}
                options={LEGAL_CATEGORIES.map(c => ({ value: c, label: t(`practice_${c.toLowerCase()}`,language) }))}
                ariaLabel={t("legal_category",language)}
                className={`w-full rounded-xl text-sm border outline-none transition-colors ${inp}`}
                style={isDark ? { background: "#1a2235" } : {}}
              />
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>{t("legal_service_name",language)}</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t("legal_service_name_ph",language)} className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors text-sm ${inp}`} />
            </div>
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${sub}`}>{t("legal_description",language)}</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t("legal_service_desc_ph",language)} rows={2}
                className={`w-full px-3 py-2 rounded-xl border outline-none resize-none transition-colors text-sm ${inp}`} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                {editId ? t("legal_update",language) : t("legal_create",language)}
              </Button>
              <Button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                variant="outline" className="flex-1 rounded-xl">{t("legal_cancel",language)}</Button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 && !showForm && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className={`font-semibold text-sm ${sub}`}>{t("legal_services_none",language)}</p>
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
                {t(`practice_${cat.toLowerCase()}`,language)}
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
                        {t("legal_edit",language)}
                      </button>
                      <button onClick={() => setDeleteTarget(service.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
                        {t("legal_delete",language)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("legal_service_delete_title",language)}
        description={t("team_remove_description",language)}
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}