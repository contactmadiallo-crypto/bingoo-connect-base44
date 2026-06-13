import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Wifi, User, LogIn, UserPlus, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVICE_EMOJIS = { card: "💳", keychain: "🔑", bracelet: "📿", stand: "🪧", badge: "🎫", sticker: "🏷️" };

// Steps: landing → auth → profile_select → success
export default function DeviceActivationPage({ deviceCode, device }) {
  const [step, setStep] = useState("landing"); // landing | login | register | profile_select | success
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileUsername, setNewProfileUsername] = useState("");
  const [creatingProfile, setCreatingProfile] = useState(false);

  const queryClient = useQueryClient();

  // Check auth on mount
  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setAuthChecked(true); setStep("profile_select"); })
      .catch(() => { setAuthChecked(true); });
  }, []);

  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ["activation-profiles", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  // Auto-select first profile
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles]);

  const handleActivate = async () => {
    if (!selectedProfileId) { setError("Please select or create a profile first."); return; }
    setActivating(true);
    setError("");
    try {
      await base44.entities.NFCDevice.update(device.id, {
        profile_id: selectedProfileId,
        status: "active",
        assigned_at: new Date().toISOString(),
      });
      // Update user's owned_profile_ids
      const p = profiles.find(p => p.id === selectedProfileId);
      const ownedIds = user?.owned_profile_ids || [];
      if (!ownedIds.includes(selectedProfileId)) {
        await base44.auth.updateMe({ owned_profile_ids: [...ownedIds, selectedProfileId] });
      }
      setStep("success");
    } catch (e) {
      setError("Failed to activate device. Please try again.");
      console.error(e);
    } finally {
      setActivating(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim() || !newProfileUsername.trim()) { setError("Name and username are required."); return; }
    setCreatingProfile(true);
    setError("");
    try {
      const slug = newProfileUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const profile = await base44.entities.Profile.create({
        display_name: newProfileName.trim(),
        username: slug,
        is_active: true,
      });
      // Add to user's owned profiles
      const ownedIds = user?.owned_profile_ids || [];
      await base44.auth.updateMe({ owned_profile_ids: [...ownedIds, profile.id] });
      await refetchProfiles();
      setSelectedProfileId(profile.id);
      setNewProfileName("");
      setNewProfileUsername("");
      setCreatingProfile(false);
    } catch (e) {
      setError("Could not create profile. Try a different username.");
      setCreatingProfile(false);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login, come back to this page
    const returnUrl = `/n/${deviceCode}`;
    base44.auth.redirectToLogin(returnUrl);
  };

  const handleRegisterRedirect = () => {
    window.location.href = `/register?next=${encodeURIComponent(`/n/${deviceCode}`)}`;
  };

  const deviceEmoji = DEVICE_EMOJIS[device?.device_type] || "📱";
  const successProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #071d47 0%, #0B2E6B 60%, #0f3d8c 100%)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
          <span className="text-white font-black text-lg">B</span>
        </div>
        <span className="text-white font-black text-xl tracking-tight">Bingoo</span>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── STEP: LANDING ── */}
          {step === "landing" && authChecked && (
            <motion.div key="landing"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>

              <div className="text-6xl mb-4">{deviceEmoji}</div>
              <h1 className="text-2xl font-black text-white mb-2">Activate Your Bingoo Device</h1>
              <p className="text-white/50 text-sm mb-2">
                Device code: <span className="font-mono font-bold text-orange-400">{deviceCode}</span>
              </p>
              <p className="text-white/40 text-xs mb-8 capitalize">{device?.device_type || "NFC"} device</p>

              <div className="space-y-3">
                <Button onClick={handleLoginRedirect}
                  className="w-full h-13 text-base font-bold gap-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #FF7A00, #e86e00)", color: "#fff" }}>
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

          {/* ── STEP: PROFILE SELECT ── */}
          {step === "profile_select" && user && (
            <motion.div key="profile_select"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-4">

              {/* Device banner */}
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(255,122,0,0.12)", border: "1px solid rgba(255,122,0,0.3)" }}>
                <div className="text-3xl">{deviceEmoji}</div>
                <div>
                  <p className="text-white font-black text-sm">Device Ready to Activate</p>
                  <p className="text-white/50 text-xs font-mono">{deviceCode} · {device?.device_type}</p>
                </div>
                <div className="ml-auto">
                  <Wifi className="w-5 h-5 text-orange-400" />
                </div>
              </div>

              <div className="rounded-3xl p-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {user.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Welcome, {user.full_name?.split(" ")[0] || "there"}!</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                  </div>
                </div>

                <h2 className="text-white font-black text-lg mb-1">Choose a Profile</h2>
                <p className="text-white/40 text-sm mb-5">Which profile should this device open when tapped?</p>

                {/* Existing profiles */}
                {profiles.length > 0 ? (
                  <div className="space-y-2 mb-5">
                    {profiles.map(p => (
                      <button key={p.id} onClick={() => setSelectedProfileId(p.id)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left"
                        style={{
                          background: selectedProfileId === p.id ? "rgba(255,122,0,0.2)" : "rgba(255,255,255,0.05)",
                          border: selectedProfileId === p.id ? "1px solid rgba(255,122,0,0.5)" : "1px solid rgba(255,255,255,0.08)"
                        }}>
                        {p.profile_photo
                          ? <img src={p.profile_photo} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                          : <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                            style={{ background: p.cover_color || "#0B2E6B" }}>{p.display_name?.charAt(0)}</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{p.display_name}</p>
                          <p className="text-white/40 text-xs font-mono">@{p.username}</p>
                        </div>
                        {selectedProfileId === p.id && <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm mb-4">You don't have a profile yet. Create one below.</p>
                )}

                {/* Create new profile */}
                <details className="mb-5">
                  <summary className="text-orange-400 text-sm font-bold cursor-pointer select-none hover:text-orange-300 transition-colors">
                    + Create a new profile
                  </summary>
                  <div className="mt-4 space-y-3">
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
                    <Button onClick={handleCreateProfile} disabled={creatingProfile || !newProfileName.trim()}
                      className="w-full rounded-xl font-bold"
                      style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {creatingProfile ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Profile"}
                    </Button>
                  </div>
                </details>

                {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3 mb-4">{error}</p>}

                <Button onClick={handleActivate} disabled={activating || !selectedProfileId}
                  className="w-full h-13 text-base font-black rounded-2xl gap-2"
                  style={{ background: "linear-gradient(135deg, #FF7A00, #e86e00)", color: "#fff" }}>
                  {activating
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Activating...</>
                    : <><Wifi className="w-5 h-5" /> Activate Device <ChevronRight className="w-5 h-5" /></>
                  }
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: SUCCESS ── */}
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
              {successProfile && (
                <p className="text-white font-bold text-lg mb-6">{successProfile.display_name}</p>
              )}

              <p className="text-white/40 text-xs mb-6">
                Anyone who taps your {device?.device_type || "NFC"} device will be redirected to your profile.
              </p>

              <div className="space-y-3">
                {successProfile?.username && (
                  <a href={`/p/${successProfile.username}`}>
                    <Button className="w-full font-bold rounded-2xl"
                      style={{ background: "linear-gradient(135deg, #FF7A00, #e86e00)", color: "#fff" }}>
                      View My Profile →
                    </Button>
                  </a>
                )}
                <a href="/bingoo">
                  <Button variant="outline" className="w-full font-bold rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                    Go to Dashboard
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