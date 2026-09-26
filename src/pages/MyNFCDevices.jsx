import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ScreenPullToRefresh from "@/components/mobile/ScreenPullToRefresh";
import LostModeInfoBanner from "@/components/bingoo/LostModeInfoBanner";
import ReportLostDialog from "@/components/bingoo/ReportLostDialog";
import ReplaceDeviceDialog from "@/components/bingoo/ReplaceDeviceDialog";
import ReassignDeviceDialog from "@/components/bingoo/ReassignDeviceDialog";
import DeviceBadges from "@/components/bingoo/nfc/DeviceBadges";
import LostModeToggle from "@/components/bingoo/nfc/LostModeToggle";
import FoundReportsList from "@/components/bingoo/nfc/FoundReportsList";
import DeviceActionsBar from "@/components/bingoo/nfc/DeviceActionsBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Copy, ExternalLink, X, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Info, Zap, Layers, ArrowRightLeft, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { DEVICE_TYPES } from "@/lib/deviceTypes";
import { useNavigate } from "react-router-dom";
import { deviceUrl as buildDeviceUrl } from "@/lib/nfcUrl";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

function QRImage({ url, isDark }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return <img src={qrUrl} alt="QR Code" className={`w-40 h-40 rounded-xl shadow ${isDark ? "border border-white/10" : "border border-slate-200"}`} />;
}

function StatusBadge({ status, isDark, language }) {
  const map = {
    active:    { cls: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700", label: t("nfc_active", language) },
    assigned:  { cls: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-700", label: t("nfc_assigned", language) },
    available: { cls: isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500", label: t("nfc_available", language) },
    lost:      { cls: isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-700", label: t("nfc_lost", language) },
    disabled:  { cls: isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-50 text-orange-700", label: t("nfc_disabled", language) },
    replaced:  { cls: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-50 text-purple-700", label: t("nfc_replaced", language) },
  };
  const s = map[status] || map.available;
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${s.cls}`}>{s.label}</span>;
}

export default function MyNFCDevices() {
   const { isDark } = useBingooTheme();
   const { maxNFCDevices, isLoading: planLoading, plan: accountPlan } = usePlan();
   const qc = useQueryClient();
   const navigate = useNavigate();
   const { language } = useI18n();

   const [showActivate, setShowActivate] = useState(false);
   const [activateCode, setActivateCode] = useState("");
   const [expandedId, setExpandedId] = useState(null);
   const [copied, setCopied] = useState(null);
   const [lostDialogDevice, setLostDialogDevice] = useState(null);
  const [replaceDialogDevice, setReplaceDialogDevice] = useState(null);
  const [reassignDialogDevice, setReassignDialogDevice] = useState(null);

   const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: () => base44.auth.me() });

   // Profile IDs come from user.owned_profile_ids (the authoritative RLS field).
   // We also fetch profile records for display names, but devices don't depend on that query succeeding.
   const ownedProfileIds = user?.owned_profile_ids || [];

   const { data: profiles = [] } = useQuery({
     queryKey: ["my-profiles", user?.id],
     queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
     enabled: !!user?.id,
   });

   // Derive the definitive set of profile IDs: union of owned_profile_ids + profiles returned by filter
   const profileIds = [...new Set([
     ...ownedProfileIds,
     ...profiles.map(p => p.id),
   ])];

   // Debug logs removed — do not re-add (production data leak)

   const { data: myDevices = [], isLoading: devicesLoading } = useQuery({
     queryKey: ["my-nfc-devices-page", user?.id],
     queryFn: async () => {
       const res = await base44.functions.invoke("getMyNfcDevices", {});
       return res?.data?.devices || [];
     },
     enabled: !!user?.id,
     staleTime: 0,
     refetchOnMount: true,
     refetchInterval: 10000,
   });

  const { data: nfcAnalytics = [] } = useQuery({
    queryKey: ["nfc-analytics-page", user?.id],
    queryFn: async () => {
      const all = await Promise.all(
        profileIds.map(pid => base44.entities.Analytics.filter({ profile_id: pid, event_type: "nfc_tap" }))
      );
      return all.flat();
    },
    enabled: !!user?.id && profileIds.length > 0,
    });

    // ── Found reports for all user's devices (by owner_profile_id) ──
    const { data: foundReports = [] } = useQuery({
    queryKey: ["device-found-reports", user?.id],
    queryFn: async () => {
      const all = await Promise.all(
        profileIds.map(pid => base44.entities.LostItemReport.filter({ owner_profile_id: pid }))
      );
      return all.flat();
    },
    enabled: !!user?.id && profileIds.length > 0,
    });

    // ── User's assets (for Link to Asset action) ──
    const { data: assets = [] } = useQuery({
    queryKey: ["my-assets-nfc-page", user?.id],
    queryFn: () => base44.entities.AssetItem.filter({ owner_user_id: user.id }),
    enabled: !!user?.id,
    });

    const handleActivateCode = async () => {
    if (!activateCode.trim()) return;
    setActivating(true);
    setActivateMsg(null);
    const trimmed = activateCode.trim().toUpperCase();
    try {
      // Admin fetches all devices; user queries may be RLS-gated, so use getDeviceByCode function
      const result = await base44.functions.invoke("getDeviceByCode", { code: trimmed });
      const device = result?.data?.device;

      if (!device) {
        setActivateMsg({ type: "error", text: t("nfc_msg_not_found_card", language) });
        setActivating(false);
        return;
      }

      if (device.status === "disabled") {
        setActivateMsg({ type: "error", text: t("nfc_msg_disabled", language) });
        setActivating(false);
        return;
      }

      if (device.status === "replaced") {
        setActivateMsg({ type: "error", text: `${t("nfc_msg_replaced_device_code", language)} ${device.replaced_by_code || t("nfc_msg_contact_support", language)}.` });
        setActivating(false);
        return;
      }

      if (device.profile_id && !profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "error", text: t("nfc_msg_other_account_device", language) });
        setActivating(false);
        return;
      }

      if (device.profile_id && profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "info", text: `✅ ${t("nfc_msg_already_linked", language)}` });
        setActivating(false);
        return;
      }

      // Assign to first profile
      const firstProfile = profiles[0];
      if (!firstProfile) {
        setActivateMsg({ type: "error", text: t("nfc_msg_create_profile_first", language) });
        setActivating(false);
        return;
      }

      // Route through activateNfcDevice backend function (uses service role to bypass RLS,
      // enforces plan limits, and writes the audit log server-side).
      const activateResult = await base44.functions.invoke("activateNfcDevice", {
        device_id: device.id,
        profile_id: firstProfile.id,
        user_id: user.id,
        user_name: user.full_name,
        profile_name: firstProfile.display_name,
        old_status: device.status,
      });

      if (activateResult?.data?.error) {
        setActivateMsg({ type: "error", text: `${t("nfc_msg_activation_failed", language)} ${activateResult.data.error}` });
        setActivating(false);
        return;
      }

      setActivateMsg({ type: "success", text: `🎉 ${t("nfc_device_singular", language)} ${trimmed} ${t("nfc_msg_activated_profile_full", language)} ${firstProfile.display_name}.` });
      setActivateCode("");
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
      qc.invalidateQueries({ queryKey: ["my-nfc-devices"] });
    } catch (e) {
      setActivateMsg({ type: "error", text: `${t("nfc_msg_activation_failed", language)} ${e.message}` });
    }
    setActivating(false);
  };

  // Optimistic cache helper — updates a device in the devices query cache and
  // returns a snapshot for rollback. Lets assignments, lost-mode toggles, and
  // unlinks reflect instantly in the UI before the server round-trip completes.
  const optimisticUpdate = async (deviceId, patch) => {
    await qc.cancelQueries({ queryKey: ["my-nfc-devices-page"] });
    const snapshot = qc.getQueryData(["my-nfc-devices-page", user?.id]);
    qc.setQueryData(["my-nfc-devices-page", user?.id], (old) =>
      (old || []).map(d => d.id === deviceId ? { ...d, ...(typeof patch === "function" ? patch(d) : patch) } : d)
    );
    return { snapshot };
  };

  const reportLost = useMutation({
    mutationFn: async (device) => {
      const res = await base44.functions.invoke("updateNfcDeviceStatus", { device_id: device.id, status: "lost" });
      if (res?.data?.error) throw new Error(res.data.error);
      return res;
    },
    onMutate: async (device) => optimisticUpdate(device.id, { status: "lost" }),
    onSuccess: () => {
      toast.success(`🔒 ${t("nfc_toast_lost_on", language)}`);
      setLostDialogDevice(null);
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e, device, context) => {
      if (context?.snapshot) qc.setQueryData(["my-nfc-devices-page", user?.id], context.snapshot);
      toast.error(e.message || t("nfc_toast_lost_on_error", language));
    },
  });

  const reactivate = useMutation({
    mutationFn: async (device) => {
      const res = await base44.functions.invoke("updateNfcDeviceStatus", { device_id: device.id, status: "active" });
      if (res?.data?.error) throw new Error(res.data.error);
      return res;
    },
    onMutate: async (device) => optimisticUpdate(device.id, { status: "active" }),
    onSuccess: () => {
      toast.success(t("nfc_toast_reactivated", language));
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e, device, context) => {
      if (context?.snapshot) qc.setQueryData(["my-nfc-devices-page", user?.id], context.snapshot);
      toast.error(e.message || t("nfc_toast_lost_off_error", language));
    },
  });

  // ── Link device to profile ──
  const linkProfile = useMutation({
    mutationFn: async ({ deviceId, profileId }) => base44.entities.NFCDevice.update(deviceId, { profile_id: profileId }),
    onMutate: async ({ deviceId, profileId }) => optimisticUpdate(deviceId, { profile_id: profileId }),
    onSuccess: () => { toast.success(t("nfc_toast_link_profile", language)); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); },
    onError: (e, vars, context) => {
      if (context?.snapshot) qc.setQueryData(["my-nfc-devices-page", user?.id], context.snapshot);
      toast.error(e.message || t("nfc_toast_link_profile_error", language));
    },
  });

  // ── Link device to asset (bidirectional) ──
  const linkAsset = useMutation({
    mutationFn: async ({ deviceId, assetId }) => {
      await base44.entities.NFCDevice.update(deviceId, { assigned_asset_id: assetId });
      await base44.entities.AssetItem.update(assetId, { nfc_device_id: deviceId });
    },
    onMutate: async ({ deviceId, assetId }) => optimisticUpdate(deviceId, { assigned_asset_id: assetId }),
    onSuccess: () => { toast.success(t("nfc_toast_link_asset", language)); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); qc.invalidateQueries({ queryKey: ["my-assets-nfc-page"] }); },
    onError: (e, vars, context) => {
      if (context?.snapshot) qc.setQueryData(["my-nfc-devices-page", user?.id], context.snapshot);
      toast.error(e.message || t("nfc_toast_link_asset_error", language));
    },
  });

  // ── Unlink device from profile and/or asset ──
  const unlinkDevice = useMutation({
    mutationFn: async (device) => {
      const updates = {};
      if (device.profile_id) updates.profile_id = "";
      if (device.assigned_asset_id) {
        updates.assigned_asset_id = "";
        await base44.entities.AssetItem.update(device.assigned_asset_id, { nfc_device_id: "" });
      }
      await base44.entities.NFCDevice.update(device.id, updates);
    },
    onMutate: async (device) => optimisticUpdate(device.id, { profile_id: "", assigned_asset_id: "" }),
    onSuccess: () => { toast.success(t("nfc_toast_unlinked", language)); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); qc.invalidateQueries({ queryKey: ["my-assets-nfc-page"] }); },
    onError: (e, device, context) => {
      if (context?.snapshot) qc.setQueryData(["my-nfc-devices-page", user?.id], context.snapshot);
      toast.error(e.message || t("nfc_toast_unlink_error", language));
    },
  });

  // ── Delete device ──
  const deleteDevice = useMutation({
    mutationFn: async (device) => base44.entities.NFCDevice.delete(device.id),
    onSuccess: () => { toast.success(t("nfc_toast_deleted", language)); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); },
    onError: (e) => toast.error(e.message || t("nfc_toast_delete_error", language)),
  });

  // ── Found report management ──
  const markReportFound = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.update(reportId, { status: "recovered" }),
    onSuccess: () => { toast.success(t("nfc_toast_recovered", language)); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || t("nfc_toast_report_update_error", language)),
  });
  const markReportContacted = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.update(reportId, { status: "contacted" }),
    onSuccess: () => { toast.success(t("nfc_toast_contacted", language)); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || t("nfc_toast_report_update_error", language)),
  });
  const deleteReport = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.delete(reportId),
    onSuccess: () => { toast.success(t("nfc_toast_report_deleted", language)); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || t("nfc_toast_report_delete_error", language)),
  });

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getProfile = (id) => {
    const p = profiles.find(p => p.id === id);
    if (p) return p;
    // profile_id set but profile no longer in the user's list (deleted/orphaned) → unassigned state
    if (id) return { display_name: t("nfc_unassigned", language), orphaned: true };
    return { display_name: t("nfc_unassigned", language), orphaned: false };
  };
  // Per-device tap counts from nfc_tap analytics (matched by device_id)
  const tapsByDevice = nfcAnalytics.reduce((acc, a) => {
    if (a.device_id) acc[a.device_id] = (acc[a.device_id] || 0) + 1;
    return acc;
  }, {});
  const activeCount = myDevices.filter(d => d.status === "active").length;
  const totalCount = myDevices.length;
  const totalScans = nfcAnalytics.length;
  const unassignedCount = myDevices.filter(device => !device.profile_id && !device.assigned_asset_id).length;

  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const inputCls = `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
    isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
      : "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
  }`;

  // The first profile is used to drive sidebar gating — so business/salon/lawfirm users
  // see their full sidebar even when entering from the NFC Devices page.
  const firstProfile = profiles[0] || null;

  // Free-plan gate — show upgrade prompt instead of full device management UI
  if (!planLoading && maxNFCDevices === 0) {
    return (
      <BingooLayout selectedProfile={firstProfile} accountPlan={accountPlan}>
        <div className="p-6 max-w-xl mx-auto mt-12 text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-5xl"
            style={{ background: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)" }}>
            📲
          </div>
          <div>
            <p className={`font-black text-xl mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{t("nfc_professional_feature", language)}</p>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {t("nfc_professional_copy", language)}
            </p>
          </div>
          <a href="/plans">
            <Button className="font-bold px-8 py-3 rounded-2xl" style={{ background: "#f97316", color: "#fff" }}>
              {t("nfc_view_plans", language)}
            </Button>
          </a>
          <a href="/shop" className="block">
            <Button variant="outline" className={`w-full font-bold gap-2 ${isDark ? "border-white/20 text-white/60 bg-transparent hover:bg-white/10" : ""}`}>
              🛍️ {t("nfc_order_hardware", language)}
            </Button>
          </a>
        </div>
      </BingooLayout>
    );
  }

  return (
    <BingooLayout selectedProfile={firstProfile} accountPlan={accountPlan}>
      <div className="px-3 sm:px-4 pb-10 pt-2 md:px-6 max-w-5xl mx-auto space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
        <ScreenPullToRefresh onRefresh={() => qc.invalidateQueries()} disabled={showActivate || !!lostDialogDevice || !!replaceDialogDevice || !!reassignDialogDevice} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-black ${headText}`}>{t("nfc_devices_title", language)}</h1>
            <p className={`text-sm mt-1 ${mutedText}`}>{t("nfc_devices_subtitle", language)}</p>
          </div>
            <Button
              onClick={() => navigate("/activate-device")}
              className="h-12 px-5 sm:px-6 rounded-xl font-black gap-2 flex-shrink-0 w-full sm:w-auto"
              style={{ background: "#f97316", color: "#fff" }}
            >
              <Plus className="w-5 h-5" /> {t("nfc_activate_device", language)}
            </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: t("nfc_total_devices", language), value: totalCount, icon: Smartphone, color: "#0b2149", iconBg: isDark ? "rgba(255,255,255,.08)" : "#f1f5f9" },
            { label: t("nfc_active", language), value: activeCount, icon: CheckCircle, color: "#22c55e", iconBg: isDark ? "rgba(34,197,94,.12)" : "#f0fdf4" },
            { label: t("nfc_unassigned", language), value: unassignedCount, icon: X, color: "#64748b", iconBg: isDark ? "rgba(255,255,255,.08)" : "#f8fafc" },
            { label: t("nfc_total_taps", language), value: totalScans, icon: Zap, color: "#f97316", iconBg: isDark ? "rgba(249,115,22,.12)" : "#fff7ed" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border p-3.5 sm:p-5 min-h-[132px] sm:min-h-[150px] flex flex-col justify-between min-w-0" style={{ background: bg, borderColor: border }}>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.iconBg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </span>
              <div>
                <p className={`text-3xl font-black ${headText}`}>{stat.value}</p>
                <p className={`text-sm font-medium ${mutedText}`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Activate by Code Panel */}
        <AnimatePresence>
          {showActivate && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl p-4 sm:p-6 space-y-4 min-w-0"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-black text-lg ${headText}`}>{t("nfc_activate_new", language)}</h2>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>{t("nfc_activate_new_copy", language)}</p>
                </div>
                <button onClick={() => setShowActivate(false)} className={`${mutedText} hover:text-red-400 transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium ${isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-300" : "bg-blue-50 border border-blue-100 text-blue-700"}`}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{t("nfc_code_hint", language)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className={`${inputCls} flex-1 font-mono`}
                  placeholder="BG-000001"
                  value={activateCode}
                  onChange={e => setActivateCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleActivateCode()}
                />
                <Button onClick={handleActivateCode} disabled={!activateCode.trim()}
                  className="font-bold px-6 min-h-[44px] w-full sm:w-auto"
                  style={{ background: "#22c55e", color: "#fff" }}>
                  {t("nfc_activate_short", language)}
                </Button>
              </div>

              {activateMsg && (
                <div className={`flex items-start gap-3 p-4 rounded-xl ${
                  activateMsg.type === "success" ? (isDark ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200")
                  : activateMsg.type === "error" ? (isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200")
                  : (isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-100")
                }`}>
                  {activateMsg.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                  : activateMsg.type === "error" ? <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  : <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                  <p className="text-sm font-semibold">{activateMsg.text}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lost Mode Info Banner */}
        <LostModeInfoBanner isDark={isDark} />

        {/* Loading state */}
        {(!user || devicesLoading) && (
          <div className="rounded-2xl p-10 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
            <p className={`text-sm font-medium ${mutedText}`}>{t("nfc_loading_devices", language)}</p>
          </div>
        )}

        {/* Empty state */}
        {user && !devicesLoading && myDevices.length === 0 && (
          <div className="rounded-2xl p-10 text-center space-y-5" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-5xl"
              style={{ background: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)" }}>
              📲
            </div>
            <div>
              <p className={`font-black text-lg mb-1 ${headText}`}>{t("nfc_none_yet", language)}</p>
              <p className={`text-sm ${mutedText}`}>{t("nfc_none_copy", language)}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/activate-device")} style={{ background: "#f97316", color: "#fff" }} className="font-bold gap-2">
                <Plus className="w-4 h-4" /> {t("nfc_activate_device", language)}
              </Button>
              <a href="/shop" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={`w-full sm:w-auto font-bold gap-2 ${isDark ? "border-white/20 text-white/70 hover:bg-white/10 bg-transparent" : ""}`}>
                  🛍️ {t("nfc_order_card", language)}
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Device List — grouped by profile */}
        {user && !devicesLoading && myDevices.length > 0 && (
          <div className="space-y-6">
            {(() => {
              // Group devices by profile_id
              const groups = {};
              myDevices.forEach(d => {
                const pid = d.profile_id || "_unassigned";
                if (!groups[pid]) groups[pid] = [];
                groups[pid].push(d);
              });
              const groupEntries = Object.entries(groups);

              return groupEntries.map(([pid, devices]) => {
                const profile = getProfile(pid === "_unassigned" ? null : pid);
                const isMulti = devices.length > 1;
                const lostCount = devices.filter(d => d.status === "lost").length;
                const activeCountInGroup = devices.filter(d => d.status === "active").length;

                return (
                  <div key={pid} className="space-y-3">
                    {/* Profile Group Header */}
                    <div className={`flex items-center gap-2.5 px-1 ${isMulti ? "" : "hidden"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                        <Layers className={`w-4 h-4 ${isDark ? "text-white/50" : "text-slate-500"}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${headText}`}>{profile?.display_name || t("nfc_unassigned", language)}</p>
                        <p className={`text-xs ${mutedText}`}>
                          {devices.length} {t(devices.length === 1 ? "nfc_device_singular" : "nfc_device_plural", language)}
                          {activeCountInGroup > 0 && <> · <span className="text-emerald-500 font-semibold">{activeCountInGroup} {t("nfc_active_lower", language)}</span></>}
                          {lostCount > 0 && <> · <span className="text-red-500 font-semibold">{lostCount} {t("nfc_lost_lower", language)}</span></>}
                        </p>
                      </div>
                    </div>

                    {/* Devices in this group */}
                    <div className={`space-y-4 ${isMulti ? "sm:pl-2" : ""}`}>
            {devices.map(device => {
              const deviceUrl = buildDeviceUrl(device.device_code);
              const typeInfo = DEVICE_TYPES.find(t => t.value === device.device_type) || DEVICE_TYPES[0];
              const isExpanded = expandedId === device.id;
              const isLost = device.status === "lost";
              const isDisabled = device.status === "disabled" || device.status === "replaced";
              const deviceReports = foundReports.filter(r => r.device_code === device.device_code);

              return (
                <motion.div key={device.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: bg, border: `1px solid ${isLost ? "rgba(239,68,68,0.3)" : border}` }}>

                  {/* Card Header */}
                  <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden ${isLost ? "bg-red-500/15" : isDisabled ? "bg-slate-500/15" : "bg-gradient-to-br from-orange-500/20 to-amber-500/20"}`}>
                      {device.product_image ? (
                        <img src={device.product_image} alt={device.product_name || typeInfo.label} className="w-full h-full object-cover" />
                      ) : (
                        typeInfo.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-black text-sm font-mono ${headText}`}>{device.device_code}</p>
                        <StatusBadge status={device.status} isDark={isDark} language={language} />
                      </div>
                      <p className={`text-xs mt-0.5 ${mutedText} flex items-center gap-1.5 flex-wrap`}>
                        <span className="font-semibold">{device.product_name || typeInfo.label}</span>
                        {profile && <span>· <span className={`font-semibold ${profile.orphaned ? "text-amber-500" : ""}`}>{profile.display_name}{profile.orphaned ? ` (${t("nfc_removed", language)})` : ""}</span></span>}
                        {device.assigned_at && <span>· {t("nfc_activated_date", language)} {device.assigned_at.slice(0, 10)}</span>}
                        <span className="flex items-center gap-0.5">· <Zap className="w-3 h-3" style={{ color: "#FDBA21" }} /> {tapsByDevice[device.id] || 0} {t((tapsByDevice[device.id] || 0) === 1 ? "nfc_tap_singular" : "nfc_tap_plural", language)}</span>
                      </p>
                      <DeviceBadges
                        device={device}
                        hasProfile={!!device.profile_id && !profile?.orphaned}
                        hasAsset={!!device.assigned_asset_id}
                        reportCount={deviceReports.length}
                        isDark={isDark}
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isDisabled && (
                        <a href={deviceUrl} target="_blank" rel="noopener noreferrer"
                          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-blue-400" : "hover:bg-blue-50 text-slate-400 hover:text-blue-600"}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : device.id)}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`px-4 pb-6 pt-2 border-t space-y-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                              { label: t("nfc_device_code_label", language), value: device.device_code },
                              { label: t("nfc_type", language), value: typeInfo.label },
                              { label: t("nfc_profile_label", language), value: profile?.orphaned ? t("nfc_unassigned", language) : (profile?.display_name || "—") },
                              { label: t("nfc_status_label", language), value: device.status },
                              { label: t("nfc_taps_label", language), value: tapsByDevice[device.id] || 0 },
                            ].map(item => (
                              <div key={item.label} className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>{item.label}</p>
                                <p className={`text-sm font-black mt-1 ${headText} capitalize`}>{item.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Device URL */}
                          {!isDisabled && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>{t("nfc_device_url", language)}</p>
                              <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                                <span className={`font-mono text-sm flex-1 break-all ${headText}`}>{deviceUrl}</span>
                                <button onClick={() => copyUrl(deviceUrl, device.id)}
                                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === device.id ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                                  {copied === device.id ? <><CheckCircle className="w-3.5 h-3.5" /> {t("nfc_copied", language)}</> : <><Copy className="w-3.5 h-3.5" /> {t("nfc_copy", language)}</>}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* QR Code */}
                          {!isDisabled && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>{t("nfc_qr_code", language)}</p>
                              <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <QRImage url={deviceUrl} isDark={isDark} />
                                <div className="space-y-2 text-sm">
                                  <p className={`font-semibold ${headText}`}>{t("nfc_share_qr", language)}</p>
                                  <p className={`${mutedText} text-xs`}>{t("nfc_share_qr_copy", language)}</p>
                                  <a href={deviceUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" /> {t("nfc_open_device_url", language)}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Lost Mode Toggle */}
                          <LostModeToggle
                            device={device}
                            reportCount={deviceReports.length}
                            isDark={isDark}
                            isPending={reportLost.isPending || reactivate.isPending}
                            onTurnOn={() => setLostDialogDevice(device)}
                            onTurnOff={() => reactivate.mutate(device)}
                          />

                          {/* Found Reports */}
                          <FoundReportsList
                            reports={deviceReports}
                            isDark={isDark}
                            onMarkContacted={(rid) => markReportContacted.mutate(rid)}
                            onMarkFound={(rid) => markReportFound.mutate(rid)}
                            onDeleteReport={(rid) => deleteReport.mutate(rid)}
                          />

                          {/* Device Actions */}
                          <DeviceActionsBar
                            device={device}
                            profiles={profiles}
                            assets={assets}
                            hasProfile={!!device.profile_id && !profile?.orphaned}
                            hasAsset={!!device.assigned_asset_id}
                            isDark={isDark}
                            onLinkProfile={(deviceId, pid) => linkProfile.mutate({ deviceId, profileId: pid })}
                            onLinkAsset={(deviceId, aid) => linkAsset.mutate({ deviceId, assetId: aid })}
                            onUnlink={(d) => unlinkDevice.mutate(d)}
                            onReplace={(d) => setReplaceDialogDevice(d)}
                            onDelete={(d) => deleteDevice.mutate(d)}
                          />

                          {/* Reassign Profile (for multi-profile accounts) */}
                          {!isDisabled && (profiles.length > 1 || profile?.orphaned) && (
                            <div className={`rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                              <div className="flex items-center justify-between gap-3">
                                <p className={`text-xs font-bold ${mutedText}`}>{t("nfc_reassign_profile", language)}</p>
                                <button onClick={() => setReassignDialogDevice(device)}
                                  className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
                                  <ArrowRightLeft className="w-3 h-3 inline mr-1" /> {t("nfc_reassign", language)}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replaced notice */}
                          {isDisabled && (
                            <div className={`rounded-xl p-4 ${isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"}`}>
                              <p className={`font-bold text-sm ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                                {device.status === "replaced" ? `🔄 ${t("nfc_notice_replaced_title", language)}` : `🚫 ${t("nfc_notice_disabled_title", language)}`}
                              </p>
                              <p className={`text-xs mt-1 ${isDark ? "text-purple-400/60" : "text-purple-600"}`}>
                                {device.status === "replaced"
                                  ? `${t("nfc_notice_replaced_copy", language)} ${device.replaced_by_code ? `${t("nfc_notice_new_code", language)} ${device.replaced_by_code}` : t("nfc_notice_contact_new_code", language)}`
                                  : t("nfc_notice_disabled_copy", language)}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>
                  );
                  })}
                   </div>
                  </div>
                  );
                  })
                  })()}
                  </div>
                  )}

                  {/* Report Lost Confirmation Dialog */}
                  <ReportLostDialog
                  open={!!lostDialogDevice}
                  device={lostDialogDevice}
                  isDark={isDark}
                  isPending={reportLost.isPending}
                  onClose={() => setLostDialogDevice(null)}
                  onConfirm={() => lostDialogDevice && reportLost.mutate(lostDialogDevice)}
                  />

                  {/* Replace Device Dialog */}
                  <ReplaceDeviceDialog
                    open={!!replaceDialogDevice}
                    device={replaceDialogDevice}
                    profile={replaceDialogDevice ? getProfile(replaceDialogDevice.profile_id) : null}
                    user={user}
                    isDark={isDark}
                    onClose={() => setReplaceDialogDevice(null)}
                    onSuccess={() => {
                      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
                      qc.invalidateQueries({ queryKey: ["my-nfc-devices"] });
                      qc.invalidateQueries({ queryKey: ["nfc-analytics-page"] });
                    }}
                  />

                  {/* Reassign Device Dialog */}
                  <ReassignDeviceDialog
                    open={!!reassignDialogDevice}
                    device={reassignDialogDevice}
                    profiles={profiles}
                    isDark={isDark}
                    onClose={() => setReassignDialogDevice(null)}
                    onSuccess={() => {
                      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
                      qc.invalidateQueries({ queryKey: ["my-nfc-devices"] });
                    }}
                  />

                  {/* Order CTA */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "linear-gradient(135deg,#0b2149,#13284f)", border: "1px solid rgba(249,115,22,0.2)" }}>
          <p className="font-black text-white mb-1">{t("nfc_need_more", language)}</p>
          <p className="text-white/50 text-xs mb-4">{t("nfc_need_more_copy", language)}</p>
          <a href="/shop">
            <Button style={{ background: "#f97316", color: "#fff" }} className="font-bold gap-2">
              🛍️ {t("nfc_shop_devices", language)}
            </Button>
          </a>
        </div>
      </div>
    </BingooLayout>
  );
}