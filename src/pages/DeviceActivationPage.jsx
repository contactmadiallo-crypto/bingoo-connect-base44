import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Wifi, LogIn, UserPlus, ChevronRight, Loader2,
  RefreshCw, Briefcase, Package, Plus, AlertCircle, Info, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDeviceTypeLabel, getDeviceEmoji } from "@/lib/deviceTypes";

// ── Status display config ──
const STATUS_CONFIG = {
  available:    { label: "Ready to Activate", color: "#22c55e", icon: CheckCircle },
  active:       { label: "Already Activated", color: "#3b82f6", icon: Info },
  assigned:     { label: "Already Activated", color: "#3b82f6", icon: Info },
  replaced:     { label: "Replaced",           color: "#f59e0b", icon: AlertCircle },
  disabled:     { label: "Disabled",            color: "#ef4444", icon: AlertCircle },
  lost:         { label: "Reported Lost/Stolen", color: "#ef4444", icon: AlertCircle },
};

const ORANGE = "#f97316";

export default function DeviceActivationPage({ deviceCode, device }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("loading"); // loading | landing | profile_select | success | error_state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Assignment state
  const [assignMode, setAssignMode] = useState("profile"); // profile | asset
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Create new profile
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileUsername, setNewProfileUsername] = useState("");
  const [creatingProfile, setCreatingProfile] = useState(false);

  // Create new asset
  const [showCreateAsset, setShowCreateAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState("pet");
  const [creatingAsset, setCreatingAsset] = useState(false);

  // ── Device status check ──
  const deviceStatus = device?.status || "available";
  const statusConfig = STATUS_CONFIG[deviceStatus] || STATUS_CONFIG.available;
  const deviceEmoji = getDeviceEmoji(device?.device_type);
  const deviceTypeLabel = getDeviceTypeLabel(device?.device_type);
  const isActivatable = deviceStatus === "available" || deviceStatus === "assigned";

  // If device is in a non-activatable state (replaced, disabled, lost), show error_state
  useEffect(() => {
    if (!isActivatable) {
      setStep("error_state");
      setAuthChecked(true);
      return;
    }
    // Check auth
    base44.auth.me()
      .then(u => { setUser(u); setAuthChecked(true); setStep("profile_select"); })
      .catch(() => { setAuthChecked(true); setStep("landing"); });
  }, [isActivatable]);

  // Fetch user's profiles and assets
  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ["activation-profiles", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  const { data: myAssets = [], refetch: refetchAssets } = useQuery({
    queryKey: ["activation-assets", user?.id],
    queryFn: () => base44.entities.AssetItem.filter({ owner_user_id: user.id }),
    enabled: !!user?.id,
  });

  // Auto-select first profile
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles]);

  // ── Activation handler ──
  const handleActivate = async () => {
    setActivating(true);
    setError("");

    try {
      let payload;

      if (assignMode === "asset") {
        if (!selectedAssetId) {
          setError("You must choose an asset first.");
          setActivating(false);
          return;
        }
        const targetAsset = myAssets.find(a => a.id === selectedAssetId);
        if (!targetAsset) {
          setError("Selected asset not found. Please choose again.");
          setActivating(false);
          return;
        }
        // Assets need a profile_id for the NFCDevice record
        const assetProfileId = targetAsset.profile_id || profiles[0]?.id || null;
        if (!assetProfileId) {
          setError("Please create a profile first before assigning a device to an asset.");
          setActivating(false);
          return;
        }
        payload = {
          device_id: device.id,
          profile_id: assetProfileId,
          asset_id: targetAsset.id,
          user_id: user.id,
          user_name: user.full_name,
          old_status: device.status,
        };
      } else {
        if (!selectedProfileId) {
          setError("You must choose a profile first.");
          setActivating(false);
          return;
        }
        const targetProfile = profiles.find(p => p.id === selectedProfileId);
        if (!targetProfile) {
          setError("Selected profile not found. Please choose again.");
          setActivating(false);
          return;
        }
        payload = {
          device_id: device.id,
          profile_id: selectedProfileId,
          user_id: user.id,
          user_name: user.full_name,
          profile_name: targetProfile.display_name,
          old_status: device.status,
        };
      }

      const result = await base44.functions.invoke("activateNfcDevice", payload);

      if (result?.data?.error) {
        // Map backend error to user-friendly message
        const backendError = result.data.error;
        if (backendError.includes("not found")) {
          setError("Device code not found. Check the code on your device and try again.");
        } else if (backendError.includes("just claimed") || backendError.includes("another account")) {
          setError("This device was just activated by another account. If this is yours, contact support.");
        } else if (backendError.includes("do not own")) {
          setError("You do not own the selected profile. Try creating a new profile.");
        } else if (backendError.includes("does not include") || backendError.includes("Upgrade")) {
          setError(backendError);
        } else if (backendError.includes("reached the device limit")) {
          setError(backendError);
        } else {
          setError(backendError);
        }
        setActivating(false);
        return;
      }

      // Success — update owned_profile_ids safety net
      if (assignMode === "profile") {
        const ownedIds = user?.owned_profile_ids || [];
        if (!ownedIds.includes(selectedProfileId)) {
          await base44.auth.updateMe({ owned_profile_ids: [...ownedIds, selectedProfileId] }).catch(() => {});
        }
      } else {
        // For asset assignment, link the asset to the device
        const targetAsset = myAssets.find(a => a.id === selectedAssetId);
        if (targetAsset) {
          await base44.entities.AssetItem.update(targetAsset.id, { nfc_device_id: device.id }).catch(() => {});
        }
      }

      queryClient.invalidateQueries({ queryKey: ["my-nfc-devices"] });
      queryClient.invalidateQueries({ queryKey: ["activation-assets"] });
      setStep("success");
    } catch (e) {
      console.error("[DeviceActivation] error:", e);
      setError("Network error, please retry. Check your connection and try again.");
    } finally {
      setActivating(false);
    }
  };

  // ── Create new profile ──
  const handleCreateProfile = async () => {
    if (!newProfileName.trim() || !newProfileUsername.trim()) {
      setError("Name and username are required to create a profile.");
      return;
    }
    setCreatingProfile(true);
    setError("");
    try {
      const slug = newProfileUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const profile = await base44.entities.Profile.create({
        display_name: newProfileName.trim(),
        username: slug,
        is_active: true,
      });
      const ownedIds = user?.owned_profile_ids || [];
      await base44.auth.updateMe({ owned_profile_ids: [...ownedIds, profile.id] }).catch(() => {});
      await refetchProfiles();
      setSelectedProfileId(profile.id);
      setAssignMode("profile");
      setShowCreateProfile(false);
      setNewProfileName("");
      setNewProfileUsername("");
    } catch (e) {
      setError("Could not create profile. That username may be taken — try a different one.");
    } finally {
      setCreatingProfile(false);
    }
  };

  // ── Create new asset ──
  const handleCreateAsset = async () => {
    if (!newAssetName.trim()) {
      setError("Asset name is required.");
      return;
    }
    if (profiles.length === 0) {
      setError("Create a profile first before creating an asset.");
      return;
    }
    setCreatingAsset(true);
    setError("");
    try {
      const asset = await base44.entities.AssetItem.create({
        owner_user_id: user.id,
        profile_id: profiles[0]?.id || null,
        asset_type: newAssetType,
        name: newAssetName.trim(),
        lost_mode_enabled: false,
      });
      await refetchAssets();
      setSelectedAssetId(asset.id);
      setAssignMode("asset");
      setShowCreateAsset(false);
      setNewAssetName("");
      setNewAssetType("pet");
    } catch (e) {
      setError("Could not create asset. Please try again.");
    } finally {
      setCreatingAsset(false);
    }
  };

  // ── Auth redirect handlers ──
  const handleLoginRedirect = () => {
    const returnUrl = `/n/${deviceCode}`;
    base44.auth.redirectToLogin(returnUrl);
  };

  const handleRegisterRedirect = () => {
    window.location.href = `/register?next=${encodeURIComponent(`/n/${deviceCode}`)}`;
  };

  const handleRetry = () => {
    setError("");
    setRetryCount(c => c + 1);
    handleActivate();
  };

  const successProfile = profiles.find(p => p.id === selectedProfileId);
  const successAsset = myAssets.find(a => a.id === selectedAssetId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 60%, #0f3d8c 100%)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
          <span className="text-white font-black text-lg">B</span>
        </div>
        <span className="text-white font-black text-xl tracking-tight">Bingoo</span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── LOADING ── */}
          {step === "loading" && (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-4" />
              <p className="text-white/50 text-sm">Checking device...</p>
            </div>
          )}

          {/* ── ERROR STATE (replaced, disabled, lost) ── */}
          {step === "error_state" && (
            <motion.div key="error_state"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${statusConfig.color}40`, backdropFilter: "blur(20px)" }}>
              <div className="text-5xl mb-4">{deviceEmoji}</div>
              <h1 className="text-xl font-black text-white mb-2">{statusConfig.label}</h1>
              <p className="text-white/50 text-sm mb-2">
                Device code: <span className="font-mono font-bold text-orange-400">{deviceCode}</span>
              </p>
              <p className="text-white/40 text-xs mb-6">{deviceTypeLabel}</p>

              {deviceStatus === "replaced" && (
                <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <p className="text-amber-400 text-sm font-semibold">
                    This device was replaced{device?.replaced_by_code ? ` — new code: ${device.replaced_by_code}` : ""}.
                  </p>
                </div>
              )}
              {deviceStatus === "disabled" && (
                <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <p className="text-red-400 text-sm font-semibold">
                    This device has been disabled. Contact support for assistance.
                  </p>
                </div>
              )}
              {deviceStatus === "lost" && (
                <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <p className="text-red-400 text-sm font-semibold">
                    This device has been reported lost or stolen. If you found it, please contact the owner.
                  </p>
                </div>
              )}

              <a href="https://bingooconnect.com" className="inline-block">
                <Button variant="outline" className="font-bold rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                  Go to Bingoo →
                </Button>
              </a>
            </motion.div>
          )}

          {/* ── LANDING (logged out) ── */}
          {step === "landing" && authChecked && (
            <motion.div key="landing"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>

              {/* Device badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-bold">Ready to Activate</span>
              </div>

              <div className="text-6xl mb-4">{deviceEmoji}</div>
              <h1 className="text-2xl font-black text-white mb-2">Activate Your Bingoo Device</h1>
              <p className="text-white/50 text-sm mb-1">
                Device code: <span className="font-mono font-bold text-orange-400">{deviceCode}</span>
              </p>
              <p className="text-white/40 text-xs mb-8">{deviceTypeLabel}</p>

              <div className="space-y-3">
                <Button onClick={handleLoginRedirect}
                  className="w-full h-13 text-base font-bold gap-3 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #e86e00)`, color: "#fff" }}>
                  <LogIn className="w-5 h-5" />
                  Log In to Activate
                </Button>
                <Button onClick={handleRegisterRedirect} variant="outline"
                  className="w-full h-13 text-base font-bold gap-3 rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </Button>
              </div>

              <p className="text-white/30 text-xs mt-6">
                Your NFC device will be linked to your Bingoo profile after login.
              </p>
            </motion.div>
          )}

          {/* ── PROFILE SELECT (logged in) ── */}
          {step === "profile_select" && user && (
            <motion.div key="profile_select"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-4">

              {/* Device banner */}
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)" }}>
                <div className="text-3xl">{deviceEmoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm">Device Ready to Activate</p>
                  <p className="text-white/50 text-xs font-mono truncate">{deviceCode} · {deviceTypeLabel}</p>
                </div>
                <Wifi className="w-5 h-5 text-orange-400 flex-shrink-0" />
              </div>

              <div className="rounded-3xl p-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>

                {/* User welcome */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {user.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">Welcome, {user.full_name?.split(" ")[0] || "there"}!</p>
                    <p className="text-white/40 text-xs truncate">{user.email}</p>
                  </div>
                </div>

                {/* Assign mode toggle */}
                <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <button onClick={() => setAssignMode("profile")}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: assignMode === "profile" ? ORANGE : "transparent",
                      color: assignMode === "profile" ? "#fff" : "rgba(255,255,255,0.4)",
                    }}>
                    <Briefcase className="w-4 h-4" /> Profile
                  </button>
                  <button onClick={() => setAssignMode("asset")}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: assignMode === "asset" ? ORANGE : "transparent",
                      color: assignMode === "asset" ? "#fff" : "rgba(255,255,255,0.4)",
                    }}>
                    <Package className="w-4 h-4" /> Asset
                  </button>
                </div>

                {/* ── PROFILE ASSIGNMENT ── */}
                {assignMode === "profile" && (
                  <div>
                    <h2 className="text-white font-black text-lg mb-1">Choose a Profile</h2>
                    <p className="text-white/40 text-sm mb-5">Which profile should this device open when tapped?</p>

                    {profiles.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {profiles.map(p => (
                          <button key={p.id} onClick={() => setSelectedProfileId(p.id)}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left"
                            style={{
                              background: selectedProfileId === p.id ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)",
                              border: selectedProfileId === p.id ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.08)",
                            }}>
                            {p.profile_photo
                              ? <img src={p.profile_photo} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                              : <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                                style={{ background: p.cover_color || "#0b2149" }}>{p.display_name?.charAt(0)}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{p.display_name}</p>
                              <p className="text-white/40 text-xs font-mono truncate">@{p.username}</p>
                            </div>
                            {selectedProfileId === p.id && <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm mb-4">You don't have a profile yet. Create one below.</p>
                    )}

                    {/* Create new profile */}
                    {!showCreateProfile ? (
                      <button onClick={() => setShowCreateProfile(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-orange-400 transition-all hover:bg-orange-500/10"
                        style={{ border: "1px dashed rgba(249,115,22,0.3)" }}>
                        <Plus className="w-4 h-4" /> Create a new profile
                      </button>
                    ) : (
                      <div className="mt-4 p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <input
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                          placeholder="Your name or business name"
                          value={newProfileName}
                          onChange={e => {
                            setNewProfileName(e.target.value);
                            setNewProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20));
                          }}
                        />
                        <input
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none font-mono"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                          placeholder="username (e.g. johndoe)"
                          value={newProfileUsername}
                          onChange={e => setNewProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleCreateProfile} disabled={creatingProfile || !newProfileName.trim()}
                            className="flex-1 rounded-xl font-bold"
                            style={{ background: ORANGE, color: "#fff" }}>
                            {creatingProfile ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Profile"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateProfile(false)}
                            className="rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ASSET ASSIGNMENT ── */}
                {assignMode === "asset" && (
                  <div>
                    <h2 className="text-white font-black text-lg mb-1">Choose an Asset</h2>
                    <p className="text-white/40 text-sm mb-5">Which asset should this device protect? Taps will open the recovery page.</p>

                    {profiles.length === 0 ? (
                      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                        <p className="text-amber-400 text-sm">
                          You need a profile before creating an asset. Switch to Profile and create one first.
                        </p>
                      </div>
                    ) : myAssets.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {myAssets.map(a => (
                          <button key={a.id} onClick={() => setSelectedAssetId(a.id)}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left"
                            style={{
                              background: selectedAssetId === a.id ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)",
                              border: selectedAssetId === a.id ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.08)",
                            }}>
                            {a.photo_url
                              ? <img src={a.photo_url} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="" />
                              : <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.08)" }}>
                                <Package className="w-5 h-5 text-white/40" />
                              </div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{a.name}</p>
                              <p className="text-white/40 text-xs capitalize truncate">{a.asset_type}</p>
                            </div>
                            {selectedAssetId === a.id && <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm mb-4">You don't have any assets yet. Create one below.</p>
                    )}

                    {/* Create new asset */}
                    {!showCreateAsset ? (
                      <button onClick={() => setShowCreateAsset(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-orange-400 transition-all hover:bg-orange-500/10"
                        style={{ border: "1px dashed rgba(249,115,22,0.3)" }}>
                        <Plus className="w-4 h-4" /> Create a new asset
                      </button>
                    ) : (
                      <div className="mt-4 p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <input
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                          placeholder="Asset name (e.g. Buddy, MacBook Pro)"
                          value={newAssetName}
                          onChange={e => setNewAssetName(e.target.value)}
                        />
                        <select
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                          value={newAssetType}
                          onChange={e => setNewAssetType(e.target.value)}>
                          <option value="pet">Pet</option>
                          <option value="luggage">Luggage</option>
                          <option value="bag">Bag</option>
                          <option value="keys">Keys</option>
                          <option value="equipment">Equipment</option>
                          <option value="vehicle">Vehicle</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="flex gap-2">
                          <Button onClick={handleCreateAsset} disabled={creatingAsset || !newAssetName.trim()}
                            className="flex-1 rounded-xl font-bold"
                            style={{ background: ORANGE, color: "#fff" }}>
                            {creatingAsset ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Asset"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateAsset(false)}
                            className="rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ERROR DISPLAY ── */}
                {error && (
                  <div className="mt-4 rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-400 text-sm font-semibold">{error}</p>
                        {error.toLowerCase().includes("upgrade") && (
                          <a href="/plans" className="inline-block mt-2 text-orange-400 text-sm font-bold hover:underline">
                            View Plans →
                          </a>
                        )}
                        {error.toLowerCase().includes("network") && (
                          <button onClick={handleRetry} disabled={activating}
                            className="mt-2 inline-flex items-center gap-2 text-orange-400 text-sm font-bold hover:underline">
                            <RefreshCw className="w-4 h-4" /> Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ACTIVATE BUTTON ── */}
                <Button onClick={handleActivate} disabled={activating || (assignMode === "profile" ? !selectedProfileId : !selectedAssetId)}
                  className="w-full h-13 mt-5 text-base font-black rounded-2xl gap-2"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #e86e00)`, color: "#fff" }}>
                  {activating
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Activating...</>
                    : <><Wifi className="w-5 h-5" /> Activate Device <ChevronRight className="w-5 h-5" /></>
                  }
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(34,197,94,0.4)", backdropFilter: "blur(20px)" }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(34,197,94,0.2)" }}>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <h1 className="text-2xl font-black text-white mb-2">Device Activated! 🎉</h1>
              <p className="text-white/50 text-sm mb-2">
                <span className="font-mono font-bold text-orange-400">{deviceCode}</span> is now linked to
              </p>
              {assignMode === "asset" && successAsset ? (
                <p className="text-white font-bold text-lg mb-1">{successAsset.name}</p>
              ) : successProfile ? (
                <p className="text-white font-bold text-lg mb-1">{successProfile.display_name}</p>
              ) : null}
              <p className="text-white/40 text-xs mb-6">
                {assignMode === "asset"
                  ? "Anyone who taps this device will see the asset recovery page."
                  : "Anyone who taps your device will be redirected to your profile."}
              </p>

              <div className="space-y-3">
                {assignMode === "profile" && successProfile?.username && (
                  <a href={`/p/${successProfile.username}`}>
                    <Button className="w-full font-bold rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${ORANGE}, #e86e00)`, color: "#fff" }}>
                      Open Profile →
                    </Button>
                  </a>
                )}
                {assignMode === "asset" && (
                  <a href={`/asset/${deviceCode}`}>
                    <Button className="w-full font-bold rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${ORANGE}, #e86e00)`, color: "#fff" }}>
                      Open Asset Page →
                    </Button>
                  </a>
                )}
                <a href="/my-nfc-devices">
                  <Button variant="outline" className="w-full font-bold rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                    <Smartphone className="w-4 h-4 mr-2" /> Go to Device Center
                  </Button>
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <p className="text-white/20 text-xs mt-8">Bingoo Connect · Smart NFC Profiles</p>
    </div>
  );
}