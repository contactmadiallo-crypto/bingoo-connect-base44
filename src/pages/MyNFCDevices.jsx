import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BingooLayout from "@/components/bingoo/BingooLayout";
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
  CheckCircle, AlertCircle, Info, Zap, Clock, AlertTriangle, Layers,
  RefreshCw, ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { DEVICE_TYPES } from "@/lib/deviceTypes";

const PROD_BASE_URL = "https://bingooconnect.com";

function QRImage({ url, isDark }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return <img src={qrUrl} alt="QR Code" className={`w-40 h-40 rounded-xl shadow ${isDark ? "border border-white/10" : "border border-slate-200"}`} />;
}

function StatusBadge({ status, isDark }) {
  const map = {
    active:    { cls: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700", label: "Active" },
    assigned:  { cls: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-700", label: "Assigned" },
    available: { cls: isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500", label: "Available" },
    lost:      { cls: isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-700", label: "Lost" },
    disabled:  { cls: isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-50 text-orange-700", label: "Disabled" },
    replaced:  { cls: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-50 text-purple-700", label: "Replaced" },
  };
  const s = map[status] || map.available;
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${s.cls}`}>{s.label}</span>;
}

export default function MyNFCDevices() {
   const { isDark } = useBingooTheme();
   const { maxNFCDevices, isLoading: planLoading, plan: accountPlan } = usePlan();
   const qc = useQueryClient();

   const [showActivate, setShowActivate] = useState(false);
   const [activateCode, setActivateCode] = useState("");
   const [activating, setActivating] = useState(false);
   const [activateMsg, setActivateMsg] = useState(null);
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

   const { data: myDevices = [], refetch: refetchDevices, isLoading: devicesLoading } = useQuery({
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
        setActivateMsg({ type: "error", text: "Device code not found. Check the code on your card and try again." });
        setActivating(false);
        return;
      }

      if (device.status === "disabled") {
        setActivateMsg({ type: "error", text: "This device has been disabled. Contact support." });
        setActivating(false);
        return;
      }

      if (device.status === "replaced") {
        setActivateMsg({ type: "error", text: `This device has been replaced. New device code: ${device.replaced_by_code || "contact support"}.` });
        setActivating(false);
        return;
      }

      if (device.profile_id && !profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "error", text: "This device is already activated by another account. Contact support if this is your device." });
        setActivating(false);
        return;
      }

      if (device.profile_id && profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "info", text: "✅ This device is already linked to your profile." });
        setActivating(false);
        return;
      }

      // Assign to first profile
      const firstProfile = profiles[0];
      if (!firstProfile) {
        setActivateMsg({ type: "error", text: "Please create a profile first before activating a device." });
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
        setActivateMsg({ type: "error", text: "Activation failed: " + activateResult.data.error });
        setActivating(false);
        return;
      }

      setActivateMsg({ type: "success", text: `🎉 Device ${trimmed} activated! It now links to your profile: ${firstProfile.display_name}.` });
      setActivateCode("");
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
      qc.invalidateQueries({ queryKey: ["my-nfc-devices"] });
    } catch (e) {
      setActivateMsg({ type: "error", text: "Activation failed: " + e.message });
    }
    setActivating(false);
  };

  const reportLost = useMutation({
    mutationFn: async (device) => {
      const res = await base44.functions.invoke("updateNfcDeviceStatus", { device_id: device.id, status: "lost" });
      if (res?.data?.error) throw new Error(res.data.error);
      return res;
    },
    onSuccess: () => {
      toast.success("🔒 Lost Mode activated. Scans are now disabled.");
      setLostDialogDevice(null);
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e) => toast.error(e.message || "Failed to activate Lost Mode"),
  });

  const reactivate = useMutation({
    mutationFn: async (device) => {
      const res = await base44.functions.invoke("updateNfcDeviceStatus", { device_id: device.id, status: "active" });
      if (res?.data?.error) throw new Error(res.data.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Device reactivated!");
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e) => toast.error(e.message || "Failed to turn off Lost Mode"),
  });

  // ── Link device to profile ──
  const linkProfile = useMutation({
    mutationFn: async ({ deviceId, profileId }) => base44.entities.NFCDevice.update(deviceId, { profile_id: profileId }),
    onSuccess: () => { toast.success("Device linked to profile"); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); },
    onError: (e) => toast.error(e.message || "Failed to link profile"),
  });

  // ── Link device to asset (bidirectional) ──
  const linkAsset = useMutation({
    mutationFn: async ({ deviceId, assetId }) => {
      await base44.entities.NFCDevice.update(deviceId, { assigned_asset_id: assetId });
      await base44.entities.AssetItem.update(assetId, { nfc_device_id: deviceId });
    },
    onSuccess: () => { toast.success("Device linked to asset"); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); qc.invalidateQueries({ queryKey: ["my-assets-nfc-page"] }); },
    onError: (e) => toast.error(e.message || "Failed to link asset"),
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
    onSuccess: () => { toast.success("Device unlinked"); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); qc.invalidateQueries({ queryKey: ["my-assets-nfc-page"] }); },
    onError: (e) => toast.error(e.message || "Failed to unlink device"),
  });

  // ── Delete device ──
  const deleteDevice = useMutation({
    mutationFn: async (device) => base44.entities.NFCDevice.delete(device.id),
    onSuccess: () => { toast.success("Device deleted"); qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }); },
    onError: (e) => toast.error(e.message || "Failed to delete device"),
  });

  // ── Found report management ──
  const markReportFound = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.update(reportId, { status: "recovered" }),
    onSuccess: () => { toast.success("Marked as recovered"); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || "Failed to update report"),
  });
  const markReportContacted = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.update(reportId, { status: "contacted" }),
    onSuccess: () => { toast.success("Marked as contacted"); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || "Failed to update report"),
  });
  const deleteReport = useMutation({
    mutationFn: async (reportId) => base44.entities.LostItemReport.delete(reportId),
    onSuccess: () => { toast.success("Report deleted"); qc.invalidateQueries({ queryKey: ["device-found-reports"] }); },
    onError: (e) => toast.error(e.message || "Failed to delete report"),
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
    if (id) return { display_name: "Unassigned", orphaned: true };
    return { display_name: "Unassigned", orphaned: false };
  };
  // Per-device tap counts from nfc_tap analytics (matched by device_id)
  const tapsByDevice = nfcAnalytics.reduce((acc, a) => {
    if (a.device_id) acc[a.device_id] = (acc[a.device_id] || 0) + 1;
    return acc;
  }, {});
  const activeCount = myDevices.filter(d => d.status === "active").length;
  const lostCount = myDevices.filter(d => d.status === "lost").length;
  const totalCount = myDevices.length;
  const totalScans = nfcAnalytics.length;

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
            <p className={`font-black text-xl mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>NFC Devices — Professional Feature</p>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Upgrade to the Professional plan to activate and manage NFC devices, enable Lost Mode, and track tap analytics.
            </p>
          </div>
          <a href="/plans">
            <Button className="font-bold px-8 py-3 rounded-2xl" style={{ background: "#f97316", color: "#fff" }}>
              View Plans
            </Button>
          </a>
          <a href="/shop" className="block">
            <Button variant="outline" className={`w-full font-bold gap-2 ${isDark ? "border-white/20 text-white/60 bg-transparent hover:bg-white/10" : ""}`}>
              🛍️ Order NFC Hardware
            </Button>
          </a>
        </div>
      </BingooLayout>
    );
  }

  return (
    <BingooLayout selectedProfile={firstProfile} accountPlan={accountPlan}>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg,#0b2149,#13284f)", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(249,115,22,0.1)" }} />
          <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#f97316,#FDBA21,#f97316)" }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}>
                📲
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">My NFC Devices</h1>
                <p className="text-xs mt-0.5 text-white/50">Manage your Bingoo NFC cards, keychains & accessories</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-emerald-400">{activeCount} Active</span>
                  {lostCount > 0 && (<>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="text-sm font-bold text-red-400">{lostCount} Lost</span>
                  </>)}
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-sm font-bold text-white/50">{totalCount} Total</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-sm font-bold" style={{ color: "#FDBA21" }}>{totalScans} Taps</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => { setShowActivate(v => !v); setActivateMsg(null); }}
              className="font-bold gap-2 flex-shrink-0"
              style={{ background: "#f97316", color: "#fff" }}
            >
              🔑 Activate Device
            </Button>
          </div>
        </div>

        {/* Activate by Code Panel */}
        <AnimatePresence>
          {showActivate && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl p-6 space-y-4"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-black text-lg ${headText}`}>Activate New Device</h2>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>Enter the code printed on your NFC card, keychain, bracelet, or package.</p>
                </div>
                <button onClick={() => setShowActivate(false)} className={`${mutedText} hover:text-red-400 transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium ${isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-300" : "bg-blue-50 border border-blue-100 text-blue-700"}`}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>The code looks like <strong>BG-000001</strong>. Find it printed on the back of your NFC device or on the packaging label.</span>
              </div>

              <div className="flex gap-3">
                <input
                  className={`${inputCls} flex-1 font-mono`}
                  placeholder="BG-000001"
                  value={activateCode}
                  onChange={e => setActivateCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleActivateCode()}
                />
                <Button onClick={handleActivateCode} disabled={activating || !activateCode.trim()}
                  className="font-bold px-6"
                  style={{ background: "#22c55e", color: "#fff" }}>
                  {activating ? "Checking…" : "Activate"}
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
            <p className={`text-sm font-medium ${mutedText}`}>Loading your devices…</p>
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
              <p className={`font-black text-lg mb-1 ${headText}`}>No NFC Devices Yet</p>
              <p className={`text-sm ${mutedText}`}>Activate your first NFC device using the code printed on your card, keychain, or bracelet.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setShowActivate(true)} style={{ background: "#f97316", color: "#fff" }} className="font-bold gap-2">
                🔑 Activate Device
              </Button>
              <a href="/shop" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={`w-full sm:w-auto font-bold gap-2 ${isDark ? "border-white/20 text-white/70 hover:bg-white/10 bg-transparent" : ""}`}>
                  🛍️ Order NFC Card
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
                        <p className={`font-bold text-sm ${headText}`}>{profile?.display_name || "Unassigned"}</p>
                        <p className={`text-xs ${mutedText}`}>
                          {devices.length} device{devices.length > 1 ? "s" : ""}
                          {activeCountInGroup > 0 && <> · <span className="text-emerald-500 font-semibold">{activeCountInGroup} active</span></>}
                          {lostCount > 0 && <> · <span className="text-red-500 font-semibold">{lostCount} lost</span></>}
                        </p>
                      </div>
                    </div>

                    {/* Devices in this group */}
                    <div className={`space-y-4 ${isMulti ? "sm:pl-2" : ""}`}>
            {devices.map(device => {
              const deviceUrl = `${PROD_BASE_URL}/n/${device.device_code}`;
              const typeInfo = DEVICE_TYPES.find(t => t.value === device.device_type) || DEVICE_TYPES[0];
              const isExpanded = expandedId === device.id;
              const isLost = device.status === "lost";
              const isDisabled = device.status === "disabled" || device.status === "replaced";
              const deviceReports = foundReports.filter(r => r.device_code === device.device_code);

              return (
                <motion.div key={device.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: bg, border: `1px solid ${isLost ? "rgba(239,68,68,0.3)" : border}` }}>

                  {/* Card Header */}
                  <div className="p-4 flex items-center gap-3">
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
                        <StatusBadge status={device.status} isDark={isDark} />
                      </div>
                      <p className={`text-xs mt-0.5 ${mutedText} flex items-center gap-1.5 flex-wrap`}>
                        <span className="font-semibold">{device.product_name || typeInfo.label}</span>
                        {profile && <span>· <span className={`font-semibold ${profile.orphaned ? "text-amber-500" : ""}`}>{profile.display_name}{profile.orphaned ? " (removed)" : ""}</span></span>}
                        {device.assigned_at && <span>· Activated {device.assigned_at.slice(0, 10)}</span>}
                        <span className="flex items-center gap-0.5">· <Zap className="w-3 h-3" style={{ color: "#FDBA21" }} /> {tapsByDevice[device.id] || 0} taps</span>
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
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-blue-400" : "hover:bg-blue-50 text-slate-400 hover:text-blue-600"}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : device.id)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
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
                              { label: "Device Code", value: device.device_code },
                              { label: "Type", value: typeInfo.label },
                              { label: "Profile", value: profile?.orphaned ? "Unassigned" : (profile?.display_name || "—") },
                              { label: "Status", value: device.status },
                              { label: "Taps", value: tapsByDevice[device.id] || 0 },
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
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>Device URL</p>
                              <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                                <span className={`font-mono text-sm flex-1 break-all ${headText}`}>{deviceUrl}</span>
                                <button onClick={() => copyUrl(deviceUrl, device.id)}
                                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === device.id ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                                  {copied === device.id ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* QR Code */}
                          {!isDisabled && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>QR Code</p>
                              <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <QRImage url={deviceUrl} isDark={isDark} />
                                <div className="space-y-2 text-sm">
                                  <p className={`font-semibold ${headText}`}>Share via QR Code</p>
                                  <p className={`${mutedText} text-xs`}>Right-click the QR image to save it, or share the URL directly.</p>
                                  <a href={deviceUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" /> Open Device URL
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
                                <p className={`text-xs font-bold ${mutedText}`}>Reassign to another profile</p>
                                <button onClick={() => setReassignDialogDevice(device)}
                                  className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
                                  <ArrowRightLeft className="w-3 h-3 inline mr-1" /> Reassign
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replaced notice */}
                          {isDisabled && (
                            <div className={`rounded-xl p-4 ${isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"}`}>
                              <p className={`font-bold text-sm ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                                {device.status === "replaced" ? "🔄 Device Replaced" : "🚫 Device Disabled"}
                              </p>
                              <p className={`text-xs mt-1 ${isDark ? "text-purple-400/60" : "text-purple-600"}`}>
                                {device.status === "replaced"
                                  ? `This device has been replaced. ${device.replaced_by_code ? `New code: ${device.replaced_by_code}` : "Contact support for your new device code."}`
                                  : "This device has been disabled by an administrator. Contact support for help."}
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
          <p className="font-black text-white mb-1">Need more NFC devices?</p>
          <p className="text-white/50 text-xs mb-4">Cards, keychains, bracelets, counter stands — all Bingoo branded.</p>
          <a href="/shop">
            <Button style={{ background: "#f97316", color: "#fff" }} className="font-bold gap-2">
              🛍️ Shop NFC Devices
            </Button>
          </a>
        </div>
      </div>
    </BingooLayout>
  );
}