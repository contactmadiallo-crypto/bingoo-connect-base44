import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import NFCSetupGuide from "@/components/bingoo/NFCSetupGuide";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle, AlertCircle, Plus, Trash2, RefreshCw, Eye, Pencil, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEVICE_TYPES, getDeviceEmoji, getDeviceTypeLabel, getDeviceDisplayName } from "@/lib/deviceTypes";
import { useProfileWorkspace } from "@/lib/ProfileWorkspaceContext";
import { ArrowRight, ArrowLeft, Check, Radio } from "lucide-react";

export default function ActivateDevice() {
  const { isDark } = useBingooTheme();
  const queryClient = useQueryClient();
  const { profiles, selectedProfile: workspaceProfile, selectProfile } = useProfileWorkspace();

  // State — pre-fill from ?code= URL param (e.g. /activate-device?code=BG-000007)
  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("code") || "").toUpperCase();
  });
  const [activating, setActivating] = useState(false);
  const [activateMsg, setActivateMsg] = useState(null); // {type: 'success'|'error', text}
  const [activationProfileId, setActivationProfileId] = useState("");
  const [activationStep, setActivationStep] = useState(1);
  const [pendingDevice, setPendingDevice] = useState(null);
  const [setupDevice, setSetupDevice] = useState(null); // device for NFC setup guide
  const [editingDevice, setEditingDevice] = useState(null); // {id, nickname}
  const [reassignDevice, setReassignDevice] = useState(null); // {device, newProfileId}
  const [assignTarget, setAssignTarget] = useState("profile"); // "profile" | "asset"
  const [selectedAsset, setSelectedAsset] = useState("");

  // Admin state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("card");
  // DEVICE_TYPES now imported from deviceTypes.js — values are: card, metal_card, keychain, bracelet, stand, sticker, badge, tag
  const [creatingCode, setCreatingCode] = useState(false);

  // Data
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: () => base44.auth.me() });
  const { data: myDevices = [], refetch: refetchDevices } = useQuery({
    queryKey: ["my-nfc-devices-page", user?.id],
    queryFn: async () => {
      if (!profiles.length) return [];
      const all = await Promise.all(
        profiles.map(p => base44.entities.NFCDevice.filter({ profile_id: p.id }))
      );
      return all.flat();
    },
    enabled: !!user?.id && profiles.length > 0,
  });
  const { data: allDevices = [], refetch: refetchAll } = useQuery({
    queryKey: ["all-nfc-devices-admin"],
    queryFn: () => base44.entities.NFCDevice.list(),
    enabled: user?.role === "admin",
  });
  const { data: myAssets = [] } = useQuery({
    queryKey: ["my-assets-activate", user?.id],
    queryFn: () => base44.entities.AssetItem.filter({ owner_user_id: user.id }),
    enabled: !!user?.id,
  });

  // Theme tokens
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardStyle = { background: bg, border: `1px solid ${border}` };
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const inputCls = `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
    isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
      : "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
  }`;

  const validateActivationCode = async () => {
    if (!code.trim()) return;
    setActivating(true);
    setActivateMsg(null);
    const trimmed = code.trim().toUpperCase();

    try {
      const result = await base44.functions.invoke("getDeviceByCode", { code: trimmed });
      const device = result?.data?.device;

      if (!device) {
        setActivateMsg({ type: "error", text: "Device code not found. Check the code on your device and try again." });
        return false;
      }

      if (device.status === "disabled") {
        setActivateMsg({ type: "error", text: "This device has been disabled. Contact support." });
        return false;
      }

      if (device.status === "replaced") {
        setActivateMsg({ type: "error", text: `This device was replaced. New code: ${device.replaced_by_code || "contact support"}.` });
        return false;
      }

      // Already claimed by this user's profile
      if (device.profile_id && profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "info", text: "✅ This device is already linked to your profile." });
        return false;
      }

      // Claimed by someone else
      if (device.profile_id && !profiles.some(p => p.id === device.profile_id)) {
        setActivateMsg({ type: "error", text: "This device is already activated by another account. Contact support if this is yours." });
        return false;
      }

      setPendingDevice(device);
      setActivationProfileId(workspaceProfile?.id || profiles[0]?.id || "");
      setActivationStep(2);
      return true;
    } catch (e) {
      console.error("[ActivateDevice] code validation error:", e);
      setActivateMsg({ type: "error", text: "Code verification failed: " + e.message });
      return false;
    } finally {
      setActivating(false);
    }
  };

  // Final activation keeps the existing service-role backend call unchanged.
  const handleActivate = async () => {
    if (!pendingDevice || !user?.id) return;
    setActivating(true);
    setActivateMsg(null);
    const trimmed = code.trim().toUpperCase();
    const device = pendingDevice;

    try {

      if (assignTarget === "asset") {
        const targetAsset = myAssets.find(a => a.id === selectedAsset);
        if (!targetAsset) {
          setActivateMsg({ type: "error", text: "Please select an asset to assign the device to." });
          return;
        }
        const assetProfileId = targetAsset.profile_id || (profiles[0]?.id || null);
        if (!assetProfileId) {
          setActivateMsg({ type: "error", text: "Please create a profile first before assigning a device to an asset." });
          return;
        }
        const activateResult = await base44.functions.invoke("activateNfcDevice", {
          device_id: device.id,
          profile_id: assetProfileId,
          user_id: user.id,
          user_name: user.full_name,
          profile_name: profiles.find(p => p.id === assetProfileId)?.display_name || "",
          old_status: device.status,
        });
        if (activateResult?.data?.error) {
          setActivateMsg({ type: "error", text: "Activation failed: " + activateResult.data.error });
          return;
        }
        await base44.entities.AssetItem.update(targetAsset.id, { nfc_device_id: device.id });
        setActivateMsg({ type: "success", text: `🎉 Device ${trimmed} activated and linked to asset: ${targetAsset.name}` });
      } else {
        const targetProfile = profiles.find(p => p.id === activationProfileId);
        if (!targetProfile) {
          setActivateMsg({ type: "error", text: "Select a profile you can access before activating this device." });
          return;
        }
        const activateResult = await base44.functions.invoke("activateNfcDevice", {
          device_id: device.id,
          profile_id: targetProfile.id,
          user_id: user.id,
          user_name: user.full_name,
          profile_name: targetProfile.display_name,
          old_status: device.status,
        });
        if (activateResult?.data?.error) {
          setActivateMsg({ type: "error", text: "Activation failed: " + activateResult.data.error });
          return;
        }
        setActivateMsg({ type: "success", text: `🎉 Device ${trimmed} activated and linked to: ${targetProfile.display_name}` });
      }

      setCode("");
      if (activationProfileId) selectProfile(activationProfileId);
      setActivationProfileId("");
      setSelectedAsset("");
      setAssignTarget("profile");
      setPendingDevice(null);
      setActivationStep(1);
      queryClient.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
      queryClient.invalidateQueries({ queryKey: ["my-devices"] });
    } catch (e) {
      console.error("[ActivateDevice] handleActivate error:", e);
      setActivateMsg({ type: "error", text: "Activation failed: " + e.message });
    } finally {
      setActivating(false);
    }
  };

  // Create device code (admin only)
  const handleCreateCode = async () => {
    if (!newCode.trim()) return;
    setCreatingCode(true);
    await base44.entities.NFCDevice.create({
      device_code: newCode.trim().toUpperCase(),
      device_type: newType,
      status: "available",
    });
    setNewCode("");
    refetchAll();
    setCreatingCode(false);
  };

  // Deactivate
  const handleDeactivate = async (device) => {
    await base44.entities.NFCDevice.update(device.id, { status: "disabled" });
    refetchDevices();
  };

  // Save nickname
  const handleSaveNickname = async () => {
    await base44.entities.NFCDevice.update(editingDevice.id, { description: editingDevice.nickname });
    setEditingDevice(null);
    refetchDevices();
  };

  // Reassign
  const handleReassign = async () => {
    if (!reassignDevice?.newProfileId) return;
    await base44.entities.NFCDevice.update(reassignDevice.device.id, { profile_id: reassignDevice.newProfileId });
    setReassignDevice(null);
    refetchDevices();
  };

  const getProfileName = (profileId) => {
    const p = profiles.find(p => p.id === profileId);
    return p ? (p.display_name || p.username) : profileId || "—";
  };

  return (
    <BingooLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-8"
          style={{ background: isDark ? "linear-gradient(135deg,#1a1f35,#0f1628)" : "linear-gradient(135deg,#eff6ff,#f8fafc)", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}` }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black ${headText}`}>Activate Device</h1>
              <p className={`text-sm mt-0.5 ${subText}`}>Connect your Bingoo NFC device to your profile</p>
            </div>
          </div>
        </div>

        {/* Three-step activation flow. Backend calls remain getDeviceByCode + activateNfcDevice. */}
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-4" aria-label={`Activation step ${activationStep} of 3`}>
            {["Enter Code", "Select Profile", "Confirm"].map((label, index) => {
              const number = index + 1;
              const complete = activationStep > number;
              const active = activationStep === number;
              return (
                <div key={label} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${complete ? "bg-emerald-500 text-white" : active ? "bg-orange-500 text-white" : isDark ? "border-2 border-white/15 text-white/40" : "border-2 border-slate-200 text-slate-400"}`}>
                      {complete ? <Check className="w-4 h-4" /> : number}
                    </span>
                    <span className={`hidden sm:block text-sm font-bold ${active ? headText : mutedText}`}>{label}</span>
                  </div>
                  {number < 3 && <span className={`w-5 sm:w-10 h-0.5 ${complete ? "bg-emerald-500" : isDark ? "bg-white/10" : "bg-slate-200"}`} />}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl p-6 sm:p-8" style={cardStyle}>
            {activationStep === 1 && (
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Radio className="w-7 h-7" />
                </div>
                <div>
                  <h2 className={`font-black text-2xl ${headText}`}>Activate your NFC device</h2>
                  <p className={`text-sm mt-1 ${subText}`}>Enter the activation code from the device packaging. It looks like BG-000041.</p>
                </div>
                <div>
                  <label className={`text-xs font-black uppercase tracking-wider ${mutedText} block mb-2`}>Activation Code</label>
                  <input className={`${inputCls} h-16 text-center font-mono text-xl sm:text-2xl font-black tracking-widest`}
                    placeholder="BG-XXXXXX" value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setActivateMsg(null); }}
                    onKeyDown={e => e.key === "Enter" && validateActivationCode()} />
                </div>
                <Button onClick={validateActivationCode} disabled={activating || !code.trim()}
                  className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black gap-2">
                  {activating ? "Checking code…" : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <p className={`text-center text-xs ${mutedText}`}>You can also scan the QR code on your device packaging.</p>
              </div>
            )}

            {activationStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className={`font-black text-2xl ${headText}`}>Link to a profile</h2>
                  <p className={`text-sm mt-1 ${subText}`}>Device {code.trim().toUpperCase()} — choose an accessible profile to link it to.</p>
                </div>
                <div className="grid gap-3">
                  {profiles.map(profile => {
                    const selected = activationProfileId === profile.id;
                    return (
                      <button type="button" key={profile.id} onClick={() => { setAssignTarget("profile"); setActivationProfileId(profile.id); }}
                        className={`w-full rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all ${selected ? "border-orange-500 bg-orange-50/70" : isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                        {profile.profile_photo ? <img src={profile.profile_photo} alt="" className="w-14 h-14 rounded-2xl object-cover" /> : (
                          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black" style={{ background: profile.cover_color || "#0b2149" }}>{profile.display_name?.charAt(0) || "P"}</span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className={`block font-black truncate ${selected && !isDark ? "text-slate-900" : headText}`}>{profile.display_name || "Untitled profile"}</span>
                          <span className={`block text-xs truncate ${selected && !isDark ? "text-slate-500" : mutedText}`}>@{profile.username || "profile"}{profile.access_role && profile.access_role !== "owner" ? ` · ${profile.access_role}` : ""}</span>
                        </span>
                        {selected && <CheckCircle className="w-5 h-5 text-orange-500" />}
                      </button>
                    );
                  })}
                  {!profiles.length && <p className={`text-sm ${mutedText}`}>Create or request access to a profile before activating a device.</p>}
                </div>
                {myAssets.length > 0 && (
                  <details className={`rounded-xl border p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <summary className={`cursor-pointer text-xs font-bold ${subText}`}>Assign to an asset instead</summary>
                    <select className={`${inputCls} mt-3`} value={selectedAsset} onChange={e => { setAssignTarget("asset"); setSelectedAsset(e.target.value); }}>
                      <option value="">Select an asset…</option>
                      {myAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_type})</option>)}
                    </select>
                  </details>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setActivationStep(1)} className="h-12 rounded-xl font-bold gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button onClick={() => setActivationStep(3)} disabled={assignTarget === "profile" ? !activationProfileId : !selectedAsset}
                    className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black gap-2">Review <ArrowRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {activationStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className={`font-black text-2xl ${headText}`}>Confirm activation</h2>
                  <p className={`text-sm mt-1 ${subText}`}>Review the device and destination before making the connection.</p>
                </div>
                <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex justify-between gap-4"><span className={mutedText}>Device code</span><strong className={headText}>{code}</strong></div>
                  <div className="flex justify-between gap-4"><span className={mutedText}>Assign to</span><strong className={`${headText} text-right`}>{assignTarget === "asset" ? myAssets.find(a => a.id === selectedAsset)?.name : profiles.find(p => p.id === activationProfileId)?.display_name}</strong></div>
                  <div className="flex justify-between gap-4"><span className={mutedText}>Status</span><strong className="text-emerald-500">Ready to activate</strong></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setActivationStep(2)} disabled={activating} className="h-12 rounded-xl font-bold gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button onClick={handleActivate} disabled={activating}
                    className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black">
                    {activating ? "Activating…" : "Activate Device"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {activateMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-3 p-4 rounded-xl ${activateMsg.type === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}
              >
                {activateMsg.type === "success"
                  ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                }
                <p className={`text-sm font-semibold ${activateMsg.type === "success" ? "text-emerald-700" : "text-red-600"}`}>{activateMsg.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Devices */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className={`font-black text-lg mb-1 ${headText}`}>My Devices</h2>
          <p className={`text-sm mb-5 ${mutedText}`}>Manage your activated NFC devices</p>

          {myDevices.length === 0 ? (
            <div className="text-center py-10">
              <Smartphone className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
              <p className={`font-semibold text-sm ${subText}`}>No devices yet</p>
              <p className={`text-xs mt-1 ${mutedText}`}>Activate your first device above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDevices.map(device => (
                <motion.div
                  key={device.id}
                  layout
                  className="rounded-xl p-4 border"
                  style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg flex-shrink-0">
                      {getDeviceEmoji(device.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingDevice?.id === device.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editingDevice.nickname}
                            onChange={e => setEditingDevice({ ...editingDevice, nickname: e.target.value })}
                            onKeyDown={e => e.key === "Enter" && handleSaveNickname()}
                            className={`${inputCls} h-8 text-sm py-1`}
                            placeholder="Device nickname"
                          />
                          <Button size="sm" onClick={handleSaveNickname} className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-3">Save</Button>
                          <button onClick={() => setEditingDevice(null)} className={`${mutedText} hover:text-red-400 transition-colors`}><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className={`font-black text-sm ${headText}`}>{device.description || device.device_code}</p>
                            {device.description && <span className={`text-xs ${mutedText}`}>{device.device_code}</span>}
                            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${device.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {device.status}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${mutedText}`}>
                            Profile: {getProfileName(device.profile_id)} · {getDeviceDisplayName(device)}
                          </p>
                        </>
                      )}
                    </div>
                    {editingDevice?.id !== device.id && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => setSetupDevice(device)} title="NFC Setup Guide"
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-blue-400" : "hover:bg-blue-50 text-slate-400 hover:text-blue-600"}`}>
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingDevice({ id: device.id, nickname: device.description || "" })} title="Rename"
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        {profiles.length > 1 && (
                          <button onClick={() => setReassignDevice({ device, newProfileId: device.profile_id })} title="Reassign Profile"
                            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/40 hover:text-violet-400" : "hover:bg-violet-50 text-slate-400 hover:text-violet-600"}`}>
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeactivate(device)} title="Deactivate"
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/20 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Admin: Create Device Codes */}
        {user?.role === "admin" && (
          <div className="rounded-2xl p-6" style={{ ...cardStyle, borderColor: isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-violet-500" />
              <h2 className={`font-black text-lg ${headText}`}>Admin: Create Device Codes</h2>
            </div>
            <p className={`text-sm mb-5 ${mutedText}`}>Generate new NFC device codes to be shipped to customers</p>

            <div className="flex gap-3 mb-5">
              <input
                className={`${inputCls} flex-1`}
                placeholder="e.g. BG-10010"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
              />
              <select
                className={`${inputCls} w-36`}
                value={newType}
                onChange={e => setNewType(e.target.value)}
              >
                {DEVICE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                ))}
              </select>
              <Button onClick={handleCreateCode} disabled={creatingCode || !newCode.trim()} className="bg-violet-600 hover:bg-violet-500 text-white font-bold gap-2 px-6">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </div>

            {allDevices.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allDevices.map(d => (
                  <div key={d.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getDeviceEmoji(d.device_type)}</span>
                      <div>
                        <p className={`font-bold text-sm ${headText}`}>{d.device_code}</p>
                        <p className={`text-xs ${mutedText}`}>{getDeviceDisplayName(d)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      d.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.status === "available"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reassign Modal */}
        <AnimatePresence>
          {reassignDevice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDark ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"}`}
              >
                <h3 className={`font-black text-lg mb-1 ${headText}`}>Reassign Device</h3>
                <p className={`text-sm mb-4 ${mutedText}`}>Choose which profile to link this device to</p>
                <select
                  className={inputCls}
                  value={reassignDevice.newProfileId || reassignDevice.device.profile_id || ""}
                  onChange={e => setReassignDevice({ ...reassignDevice, newProfileId: e.target.value })}
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.display_name || p.username}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleReassign} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold">Save</Button>
                  <Button variant="outline" onClick={() => setReassignDevice(null)} className="flex-1">Cancel</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* NFC Setup Guide */}
      <AnimatePresence>
        {setupDevice && <NFCSetupGuide device={setupDevice} onClose={() => setSetupDevice(null)} />}
      </AnimatePresence>
    </BingooLayout>
  );
}
