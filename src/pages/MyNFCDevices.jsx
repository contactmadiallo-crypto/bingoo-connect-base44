import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BingooLayout from "@/components/bingoo/BingooLayout";
import NFCSetupInstructions from "@/components/bingoo/NFCSetupInstructions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Copy, ExternalLink, X, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Info, Wifi, Zap, Clock, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { toast } from "sonner";

const DEVICE_TYPES = [
  { value: "card",     label: "Business Card", emoji: "💳" },
  { value: "keychain", label: "Keychain",       emoji: "🔑" },
  { value: "bracelet", label: "Bracelet",       emoji: "📿" },
  { value: "stand",    label: "Counter Stand",  emoji: "🪧" },
  { value: "sticker",  label: "Sticker",        emoji: "🏷️" },
  { value: "badge",    label: "Badge",           emoji: "🎫" },
];

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
   const qc = useQueryClient();

   const [showActivate, setShowActivate] = useState(false);
   const [activateCode, setActivateCode] = useState("");
   const [activating, setActivating] = useState(false);
   const [activateMsg, setActivateMsg] = useState(null);
   const [expandedId, setExpandedId] = useState(null);
   const [copied, setCopied] = useState(null);
   const [nfcWriting, setNfcWriting] = useState(null);
   const [nfcMsg, setNfcMsg] = useState(null);

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
     queryKey: ["my-nfc-devices-page", user?.id, profileIds.join(",")],
     queryFn: async () => {
       console.log("[MyNFCDevices] querying NFCDevice for profileIds:", profileIds);
       const all = await Promise.all(
         profileIds.map(pid => base44.entities.NFCDevice.filter({ profile_id: pid }))
       );
       const flat = all.flat();
       console.log("[MyNFCDevices] devices returned:", flat.length, flat.map(d => d.device_code));
       return flat;
     },
     enabled: !!user?.id && profileIds.length > 0,
     staleTime: 0,
     refetchOnMount: true,
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
    mutationFn: (device) => base44.entities.NFCDevice.update(device.id, { status: "lost" }),
    onSuccess: (_, device) => {
      toast.success("Device marked as lost. Scans are now disabled.");
      // audit log
      base44.entities.DeviceAuditLog.create({
        device_id: device.id,
        device_code: device.device_code,
        action: "lost_reported",
        performed_by: user?.id,
        performed_by_name: user?.full_name,
        old_status: device.status,
        new_status: "lost",
      }).catch(() => {});
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const reactivate = useMutation({
    mutationFn: (device) => base44.entities.NFCDevice.update(device.id, { status: "active" }),
    onSuccess: () => {
      toast.success("Device reactivated!");
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleWriteNFC = async (device) => {
    const url = `${PROD_BASE_URL}/n/${device.device_code}`;
    if (!("NDEFReader" in window)) {
      setNfcMsg({ id: device.id, text: "Web NFC is not supported in this browser. Use 'NFC Tools' app and write this URL manually.", type: "info" });
      return;
    }
    try {
      setNfcWriting(device.id);
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: url }] });
      setNfcMsg({ id: device.id, text: "NFC tag written successfully! 🎉", type: "success" });
    } catch (e) {
      setNfcMsg({ id: device.id, text: `NFC write failed: ${e.message}`, type: "error" });
    } finally {
      setNfcWriting(null);
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getProfile = (id) => profiles.find(p => p.id === id) || { display_name: id?.slice(0, 8) + "…" };
  const activeCount = myDevices.filter(d => d.status === "active").length;
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

  return (
    <BingooLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg,#0B2E6B,#1a4a9e)", border: "1px solid rgba(255,122,0,0.2)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,122,0,0.1)" }} />
          <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#FF7A00,#FDBA21,#FF7A00)" }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "rgba(255,122,0,0.2)", border: "1px solid rgba(255,122,0,0.3)" }}>
                📲
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">My NFC Devices</h1>
                <p className="text-xs mt-0.5 text-white/50">Manage your Bingoo NFC cards, keychains & accessories</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-emerald-400">{activeCount} Active</span>
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
              style={{ background: "#FF7A00", color: "#fff" }}
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
              style={{ background: isDark ? "rgba(255,122,0,0.1)" : "rgba(255,122,0,0.05)", border: "1px solid rgba(255,122,0,0.2)" }}>
              📲
            </div>
            <div>
              <p className={`font-black text-lg mb-1 ${headText}`}>No NFC Devices Yet</p>
              <p className={`text-sm ${mutedText}`}>Activate your first NFC device using the code printed on your card, keychain, or bracelet.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setShowActivate(true)} style={{ background: "#FF7A00", color: "#fff" }} className="font-bold gap-2">
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

        {/* Device List */}
        {user && !devicesLoading && myDevices.length > 0 && (
          <div className="space-y-4">
            {myDevices.map(device => {
              const deviceUrl = `${PROD_BASE_URL}/n/${device.device_code}`;
              const profile = getProfile(device.profile_id);
              const typeInfo = DEVICE_TYPES.find(t => t.value === device.device_type) || DEVICE_TYPES[0];
              const isExpanded = expandedId === device.id;
              const isLost = device.status === "lost";
              const isDisabled = device.status === "disabled" || device.status === "replaced";

              return (
                <motion.div key={device.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: bg, border: `1px solid ${isLost ? "rgba(239,68,68,0.3)" : border}` }}>

                  {/* Card Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isLost ? "bg-red-500/15" : isDisabled ? "bg-slate-500/15" : "bg-gradient-to-br from-orange-500/20 to-amber-500/20"}`}>
                      {typeInfo.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-black text-sm font-mono ${headText}`}>{device.device_code}</p>
                        <StatusBadge status={device.status} isDark={isDark} />
                        {isLost && <span className="text-xs text-red-500 font-bold">⚠️ Scans disabled</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${mutedText}`}>
                        {typeInfo.label}
                        {profile && <> · <span className="font-semibold">{profile.display_name}</span></>}
                        {device.assigned_at && <> · Activated {device.assigned_at.slice(0, 10)}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isLost ? (
                        <button onClick={() => reactivate.mutate(device)} disabled={reactivate.isPending}
                          title="Reactivate" className="text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                          Reactivate
                        </button>
                      ) : !isDisabled && (
                        <button onClick={() => reportLost.mutate(device)}
                          title="Report Lost" className="p-2 rounded-lg transition-colors"
                          style={{ color: "rgba(239,68,68,0.6)" }}>
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: "Device Code", value: device.device_code },
                              { label: "Type", value: typeInfo.label },
                              { label: "Profile", value: profile?.display_name || "—" },
                              { label: "Status", value: device.status },
                            ].map(item => (
                              <div key={item.label} className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>{item.label}</p>
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

                          {/* Lost Mode */}
                          {!isDisabled && (
                            <div className={`rounded-xl p-4 ${isLost ? (isDark ? "bg-red-500/10 border border-red-500/25" : "bg-red-50 border border-red-200") : (isDark ? "bg-white/5" : "bg-slate-50")}`}>
                              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLost ? "text-red-400" : mutedText}`}>
                                🔒 Lost Mode
                              </p>
                              {isLost ? (
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>Device is marked lost. Scans show a recovery page.</p>
                                  <button onClick={() => reactivate.mutate(device)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-xl ml-3 flex-shrink-0"
                                    style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                                    Reactivate
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className={`text-xs ${mutedText}`}>If lost or stolen, report it to disable scans and show a recovery page.</p>
                                  <button onClick={() => reportLost.mutate(device)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-xl ml-3 flex-shrink-0"
                                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                                    Report Lost
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Write NFC Tag */}
                          {!isDisabled && !isLost && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>Write to NFC Tag</p>
                              <button onClick={() => handleWriteNFC(device)} disabled={nfcWriting === device.id}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                                <Wifi className="w-4 h-4" />
                                {nfcWriting === device.id ? "Hold your NFC tag near phone…" : "Write NFC Tag"}
                              </button>
                              {nfcMsg?.id === device.id && (
                                <p className={`mt-2 text-xs font-medium p-3 rounded-xl ${
                                  nfcMsg.type === "success" ? (isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700")
                                  : nfcMsg.type === "error" ? (isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600")
                                  : (isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700")
                                }`}>{nfcMsg.text}</p>
                              )}
                            </div>
                          )}

                          {/* Setup Instructions */}
                          {!isDisabled && !isLost && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>How to Program Your NFC Tag</p>
                              <NFCSetupInstructions deviceUrl={deviceUrl} />
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
        )}

        {/* Order CTA */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "linear-gradient(135deg,#0B2E6B,#1a4a9e)", border: "1px solid rgba(255,122,0,0.2)" }}>
          <p className="font-black text-white mb-1">Need more NFC devices?</p>
          <p className="text-white/50 text-xs mb-4">Cards, keychains, bracelets, counter stands — all Bingoo branded.</p>
          <a href="/shop">
            <Button style={{ background: "#FF7A00", color: "#fff" }} className="font-bold gap-2">
              🛍️ Shop NFC Devices
            </Button>
          </a>
        </div>
      </div>
    </BingooLayout>
  );
}