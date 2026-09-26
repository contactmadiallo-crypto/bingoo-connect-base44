import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Shield, Download, Trash2, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import PhoneAlertsSection from "@/components/bingoo/PhoneAlertsSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";
import { Globe2 } from "lucide-react";
import { REGION_OPTIONS, getRegion, setRegion as persistRegion, getCurrency } from "@/lib/regionSettings";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [region, setRegion] = useState(() => getRegion());

  const handleRegionChange = (nextRegion) => {
    persistRegion(nextRegion);
    setRegion(nextRegion);
  };

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: activityLogs = [] } = useQuery({
    queryKey: ["my-activity-logs", user?.id],
    queryFn: () => base44.entities.ActivityLog.filter({ user_id: user.id }, "-timestamp", 50),
    enabled: !!user?.id,
  });

  const handleExport = async () => {
    setExporting(true);
    // Log the export action
    await base44.entities.ActivityLog.create({
      user_id: user.id,
      user_email: user.email,
      action: "data_exported",
      description: "User exported their personal data",
      timestamp: new Date().toISOString(),
    });

    // Collect all user data
    const [profiles, devices, leads, appointments] = await Promise.all([
      base44.entities.Profile.filter({ created_by_id: user.id }),
      base44.entities.NFCDevice.list(),
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Appointment.list("-created_date", 500),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      profiles,
      devices,
      leads: leads.filter(l => profiles.some(p => p.id === l.profile_id)),
      appointments: appointments.filter(a => profiles.some(p => p.id === a.profile_id)),
      activity_logs: activityLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bingoo-data-${user.email}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("account_export_success",language));
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) return;
    setDeleting(true);
    try {
      const response = await base44.functions.invoke("submitPrivacyRequest", {
        request_type: "account_deletion",
        email: user.email,
        full_name: user.full_name,
        details: "Authenticated user requested permanent account deletion from Account Settings.",
      });
      if (response?.data?.error) throw new Error(response.data.error);
      await base44.entities.ActivityLog.create({
        user_id: user.id,
        user_email: user.email,
        action: "account_deletion_requested",
        description: `Authenticated account deletion request ${response?.data?.request_id || ""}`.trim(),
        timestamp: new Date().toISOString(),
      }).catch(() => {});
      toast.success(t("account_delete_success",language));
      setDeleteConfirm("");
    } catch (error) {
      console.error("Account deletion request failed:", error);
      toast.error(error?.message || t("account_delete_failed",language));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: "rgba(11,33,73,0.97)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button type="button" onClick={() => navigate("/bingoo?view=hub")} aria-label={t("account_back_profiles",language)} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm min-h-[44px] px-2">
            <ArrowLeft className="w-4 h-4" /> {t("account_back",language)}
          </button>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <Shield className="w-4 h-4 text-white/70" />
          <span className="text-white font-bold">{t("account_settings_title",language)}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> {t("account_your_account",language)}
          </h2>
          <p className="text-slate-500 text-sm mb-4">{t("account_identity_copy",language)}</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">{t("account_full_name",language)}</p>
              <p className="font-bold text-slate-900">{user?.full_name || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">{t("account_email",language)}</p>
              <p className="font-bold text-slate-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Language & region */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-600" /> {t("language_region", language)}
          </h2>
          <p className="text-slate-500 text-sm mb-4">{t("account_language_copy", language)}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{language === "fr" ? "Langue" : "Language"}</p>
              <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{language === "fr" ? "Région" : "Region"}</p>
              <select value={region} onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
                {!REGION_OPTIONS[region] && <option value={region}>{region}</option>}
                {Object.entries(REGION_OPTIONS).map(([code, meta]) => (
                  <option key={code} value={code}>{meta.name} · {meta.currency}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">
                {language === "fr" ? "Devise régionale" : "Regional currency"}: <strong>{getCurrency(region)}</strong>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">{t("account_language_note", language)}</p>
        </div>

        {/* Notifications */}
        <PhoneAlertsSection user={user} />

        {/* Export data */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" /> {t("account_export_title",language)}
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            {t("account_export_copy",language)}
          </p>
          <Button onClick={handleExport} disabled={exporting} variant="outline"
            className="gap-2 font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? t("account_preparing_export",language) : t("account_export_title",language)}
          </Button>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" /> {t("account_delete_title",language)}
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <strong>{t("account_irreversible",language)}</strong> {t("account_delete_warning",language)}
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            {t("account_confirm_email",language)} <strong>{user?.email}</strong>
          </p>
          <input
            type="email"
            placeholder={user?.email}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            className="w-full px-4 py-2.5 border border-red-200 rounded-xl text-sm outline-none mb-4 focus:ring-2 focus:ring-red-200"
          />
          <Button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== user?.email || deleting}
            className="gap-2 font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? t("account_submitting",language) : t("account_delete_me",language)}
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            {t("account_delete_note",language)}
          </p>
        </div>

      </div>
    </div>
  );
}