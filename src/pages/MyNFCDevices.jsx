import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BingooLayout from "@/components/bingoo/BingooLayout";
import NFCSetupInstructions from "@/components/bingoo/NFCSetupInstructions";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Plus, Trash2, Copy, ExternalLink, X, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Info, Wifi, Zap, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const DEVICE_TYPES = [
  { value: "card",     label: "Business Card", emoji: "💳" },
  { value: "keychain", label: "Keychain",       emoji: "🔑" },
  { value: "bracelet", label: "Bracelet",       emoji: "📿" },
  { value: "stand",    label: "Counter Stand",  emoji: "🪧" },
  { value: "sticker",  label: "Sticker",        emoji: "🏷️" },
];

const PROD_BASE_URL = "https://bingooconnect.com";

function generateCode(existingCodes) {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const existingSet = new Set(existingCodes);
  let code;
  do {
    const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    code = `BG-${year}-${rand}`;
  } while (existingSet.has(code));
  return code;
}

function QRImage({ url }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-xl border border-slate-200 shadow" />;
}

export default function MyNFCDevices() {
  const { isDark } = useBingooTheme();
  const qc = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [activateCode, setActivateCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateMsg, setActivateMsg] = useState(null);
  const [nfcWriting, setNfcWriting] = useState(null); // device id being written
  const [nfcMsg, setNfcMsg] = useState(null); // {id, text, type}

  const handleWriteNFC = async (device) => {
    const url = `${PROD_BASE_URL}/n/${device.device_code}`;
    if (!("NDEFReader" in window)) {
      setNfcMsg({ id: device.id, text: "Web NFC not supported on this browser. Use NFC Tools app and write this URL manually.", type: "info" });
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
  const handleActivateCode = async () => {
    if (!activateCode.trim()) return;
    setActivating(true);
    setActivateMsg(null);
    const trimmed = activateCode.trim().toUpperCase();
    const devices = await base44.entities.Device.filter({ device_code: trimmed });
    if (!devices.length) {
      setActivateMsg({ type: "error", text: "Device code not found. Please check and try again." });
      setActivating(false);
      return;
    }
    const device = devices[0];
    if (device.activation_status === "active" && device.assigned_user !== user.id) {
      setActivateMsg({ type: "error", text: "This device is already activated by another account." });
      setActivating(false);
      return;
    }
    if (device.activation_status === "active" && device.assigned_user === user.id) {
      setActivateMsg({ type: "info", text: "You already own this device — it appears in your list below." });
      setActivating(false);
      return;
    }
    await base44.entities.Device.update(device.id, {
      activation_status: "active",
      assigned_user: user.id,
      assigned_profile: profiles[0]?.id || "",
      activation_date: new Date().toISOString(),
    });
    setActivateMsg({ type: "success", text: "Device activated successfully! 🎉" });
    setActivateCode("");
    qc.invalidateQueries({ queryKey: ["my-nfc-devices", user?.id] });
    setActivating(false);
  };

  const [newType, setNewType] = useState("card");
  const [newProfile, setNewProfile] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(null);

  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: () => base44.auth.me() });
  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profiles", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });
  const { data: myDevices = [] } = useQuery({
    queryKey: ["my-nfc-devices", user?.id],
    queryFn: () => base44.entities.Device.filter({ assigned_user: user.id }),
    enabled: !!user?.id,
  });

  // Analytics for NFC tap stats
  const { data: nfcAnalytics = [] } = useQuery({
    queryKey: ["nfc-analytics", user?.id],
    queryFn: async () => {
      const profileIds = profiles.map(p => p.id);
      if (!profileIds.length) return [];
      const all = await Promise.all(profileIds.map(id => base44.entities.Analytics.filter({ profile_id: id, event_type: "nfc_tap" })));
      return all.flat();
    },
    enabled: !!profiles.length,
  });

  const activeCount = myDevices.filter(d => d.activation_status === "active").length;
  const lastScan = nfcAnalytics.length > 0
    ? new Date(Math.max(...nfcAnalytics.map(e => new Date(e.created_at)))).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "No scans yet";
  const totalScans = nfcAnalytics.length;

  const addDevice = useMutation({
    mutationFn: async () => {
      const allDevices = await base44.entities.Device.list();
      const code = generateCode(allDevices.map(d => d.device_code));
      const profileId = newProfile || profiles[0]?.id || "";
      return base44.entities.Device.create({
        device_code: code,
        device_type: newType,
        activation_status: "active",
        assigned_user: user.id,
        assigned_profile: profileId,
        activation_date: new Date().toISOString(),
        nickname: newNickname.trim() || "",
      });
    },
    onSuccess: (device) => {
      qc.invalidateQueries({ queryKey: ["my-nfc-devices", user?.id] });
      setShowAdd(false);
      setNewType("card");
      setNewProfile("");
      setNewNickname("");
      setExpandedId(device.id);
    },
  });

  const removeDevice = useMutation({
    mutationFn: (id) => base44.entities.Device.update(id, {
      activation_status: "inactive",
      assigned_user: "",
      assigned_profile: "",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-nfc-devices", user?.id] }),
  });

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getProfile = (id) => profiles.find(p => p.id === id);

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
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-8"
          style={{ background: isDark ? "linear-gradient(135deg,#1a1f35,#0f1628)" : "linear-gradient(135deg,#eff6ff,#f8fafc)", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}` }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-black ${headText}`}>My NFC Devices</h1>
                <p className={`text-xs mt-0.5 max-w-xs ${mutedText}`}>Use the activation code included with your NFC card, keychain, bracelet, sticker, or package.</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-sm font-bold ${myDevices.filter(d => d.activation_status === "active").length > 0 ? "text-emerald-500" : mutedText}`}>
                    {myDevices.filter(d => d.activation_status === "active").length} Active {myDevices.filter(d => d.activation_status === "active").length === 1 ? "Device" : "Devices"}
                  </span>
                  {myDevices.length > 0 && <span className={`text-xs ${mutedText}`}>· {myDevices.length} total</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={() => { setShowActivate(v => !v); setShowAdd(false); }}
                variant="outline"
                className={`font-bold gap-2 ${isDark ? "bg-white/10 border-white/30 text-white hover:bg-white/20" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"}`}
              >
                🔑 Activate New Device
              </Button>
              <Button
                onClick={() => { setShowAdd(v => !v); setShowActivate(false); }}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" /> New Device
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {myDevices.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Smartphone className="w-4 h-4" />, label: "Active Devices", value: activeCount, color: "#10b981" },
              { icon: <Zap className="w-4 h-4" />,        label: "Total NFC Taps",  value: totalScans, color: "#8b5cf6" },
              { icon: <Clock className="w-4 h-4" />,      label: "Last Scan",       value: lastScan,   color: "#06b6d4", small: true },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-3 ${isDark ? "bg-white/5 border border-white/8" : "bg-white border border-slate-100"}`}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: s.color }}>{s.icon}</div>
                <p className={`${s.small ? "text-xs" : "text-xl"} font-black`} style={{ color: s.color }}>{s.value}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${mutedText}`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Activate by Code */}
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
                  <p className={`text-xs mt-0.5 ${mutedText}`}>Enter the activation code printed on your NFC card, keychain, or bracelet.</p>
                </div>
                <button onClick={() => setShowActivate(false)} className={`${mutedText} hover:text-red-400 transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Helper tip */}
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium ${isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-300" : "bg-blue-50 border border-blue-100 text-blue-700"}`}>
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Need a code? Scan the QR code or use the activation code included with your NFC card, keychain, or bracelet.</span>
              </div>
              <div className="flex gap-3">
                 <input
                   className={`${inputCls} flex-1`}
                   placeholder="e.g. BG-10001"
                   value={activateCode}
                   onChange={e => setActivateCode(e.target.value.toUpperCase())}
                   onKeyDown={e => e.key === "Enter" && handleActivateCode()}
                 />
                 <Button onClick={handleActivateCode} disabled={activating || !activateCode.trim()}
                   className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6">
                   {activating ? "Checking…" : "Activate"}
                 </Button>
               </div>
              {activateMsg && (
                <div className={`flex items-start gap-3 p-4 rounded-xl ${
                  activateMsg.type === "success"
                    ? (isDark ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200")
                    : activateMsg.type === "error"
                    ? (isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200")
                    : (isDark ? "bg-blue-500/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200")
                }`}>
                  {activateMsg.type === "success" ? <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> : activateMsg.type === "error" ? <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-red-400" : "text-red-500"}`} /> : <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />}
                  <p className={`text-sm font-semibold ${activateMsg.type === "success" ? (isDark ? "text-emerald-300" : "text-emerald-700") : activateMsg.type === "error" ? (isDark ? "text-red-300" : "text-red-600") : (isDark ? "text-blue-300" : "text-blue-600")}`}>{activateMsg.text}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Device Form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl p-6 space-y-4"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center justify-between">
                <h2 className={`font-black text-lg ${headText}`}>Add New Device</h2>
                <button onClick={() => setShowAdd(false)} className={`${mutedText} hover:text-red-400 transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Device Type */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${mutedText} block mb-2`}>Device Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {DEVICE_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${
                        newType === t.value
                          ? (isDark ? "border-blue-500 bg-blue-500/15 text-blue-400 shadow" : "border-blue-500 bg-blue-50 text-blue-700 shadow")
                          : isDark
                          ? "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${mutedText} block mb-1.5`}>Nickname (optional)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. My Work Card"
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                />
              </div>

              {/* Profile */}
              {profiles.length > 0 && (
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${mutedText} block mb-1.5`}>Link to Profile</label>
                  <select className={inputCls} value={newProfile} onChange={e => setNewProfile(e.target.value)}>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.display_name || p.username}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={() => addDevice.mutate()}
                disabled={addDevice.isPending || profiles.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold h-12"
              >
                {addDevice.isPending ? "Creating…" : "Create Device"}
              </Button>

              {profiles.length === 0 && (
                <p className="text-center text-sm text-amber-600">Create a profile first before adding a device.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device List */}
        {myDevices.length === 0 && !showAdd ? (
          <div className="rounded-2xl p-10 text-center space-y-5" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto">
              <Smartphone className={`w-10 h-10 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
            </div>
            <div>
              <p className={`font-black text-lg mb-1 ${headText}`}>⚠️ No NFC Device Activated</p>
              <p className={`text-sm ${mutedText}`}>Activate your first NFC card to start sharing your profile instantly — just tap to connect.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setShowActivate(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold gap-2"
              >
                🔑 Activate Device
              </Button>
              <a href="/shop" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={`w-full sm:w-auto font-bold gap-2 ${isDark ? "border-white/20 text-white/70 hover:bg-white/10" : ""}`}>
                  🛍️ Order NFC Card
                </Button>
              </a>
              <a href="/about" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className={`w-full sm:w-auto font-semibold gap-1.5 ${isDark ? "text-white/50 hover:text-white hover:bg-white/10" : "text-slate-500"}`}>
                  Learn More →
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myDevices.map(device => {
              const deviceUrl = `${PROD_BASE_URL}/n/${device.device_code}`;
              const profile = getProfile(device.assigned_profile);
              const typeInfo = DEVICE_TYPES.find(t => t.value === device.device_type) || DEVICE_TYPES[0];
              const isExpanded = expandedId === device.id;

              return (
                <motion.div key={device.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: bg, border: `1px solid ${border}` }}>

                  {/* Card Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl flex-shrink-0">
                      {typeInfo.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-black text-sm ${headText}`}>{device.nickname || device.device_code}</p>
                        {device.nickname && (
                          <span className={`font-mono text-xs ${mutedText}`}>{device.device_code}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                          {device.activation_status}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${mutedText}`}>
                        {typeInfo.label} · {profile ? (profile.display_name || profile.username) : "No profile linked"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a href={`/n/${device.device_code}`} target="_blank" rel="noopener noreferrer"
                        title="Test Device"
                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-blue-400" : "hover:bg-blue-50 text-slate-400 hover:text-blue-600"}`}>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => removeDevice.mutate(device.id)} title="Remove"
                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/20 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        <div className={`px-4 pb-6 pt-2 border-t space-y-6 ${isDark ? "border-white/10" : "border-slate-100"}`}>

                          {/* Device Info Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: "Device Code", value: device.device_code },
                              { label: "Type", value: typeInfo.label },
                              { label: "Profile", value: profile?.display_name || profile?.username || "—" },
                              { label: "Status", value: device.activation_status },
                            ].map(item => (
                              <div key={item.label} className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>{item.label}</p>
                                <p className={`text-sm font-black mt-1 ${headText}`}>{item.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Device URL + Copy */}
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>Device URL</p>
                            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isDark ? "bg-white/5" : "bg-slate-50"} border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                              <span className={`font-mono text-sm flex-1 break-all ${headText}`}>{deviceUrl}</span>
                              <button
                                onClick={() => copyUrl(deviceUrl, device.id)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  copied === device.id
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
                              >
                                {copied === device.id ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                              </button>
                            </div>
                          </div>

                          {/* QR Code */}
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>QR Code</p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              <QRImage url={deviceUrl} />
                              <div className="space-y-2 text-sm">
                                <p className={`font-semibold ${headText}`}>Use this QR code to share your device link</p>
                                <p className={`${mutedText} text-xs`}>Right-click the QR code to save it as an image.</p>
                                <a
                                  href={deviceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Open Device URL
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Write NFC */}
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>Write to NFC Tag</p>
                            <button
                              onClick={() => handleWriteNFC(device)}
                              disabled={nfcWriting === device.id}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold transition-colors"
                            >
                              <Wifi className="w-4 h-4" />
                              {nfcWriting === device.id ? "Hold your NFC tag near phone…" : "Write NFC Tag"}
                            </button>
                            {nfcMsg?.id === device.id && (
                              <p className={`mt-2 text-xs font-medium p-3 rounded-xl ${
                                nfcMsg.type === "success"
                                  ? (isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700")
                                  : nfcMsg.type === "error"
                                  ? (isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600")
                                  : (isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700")
                              }`}>
                                {nfcMsg.text}
                              </p>
                            )}
                          </div>

                          {/* Setup Instructions */}
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>How to Program Your NFC Tag (Manual)</p>
                            <NFCSetupInstructions deviceUrl={deviceUrl} />
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BingooLayout>
  );
}