import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * ReplaceDeviceDialog — user-facing flow to retire an old NFC device and
 * activate a new physical card against the same profile.
 *
 * Uses existing backend behavior only (no backend changes):
 *  1. Look up the new code via getDeviceByCode.
 *  2. Activate the new device to the old device's profile via activateNfcDevice
 *     (enforces plan limits server-side).
 *  3. Mark the old device as "replaced" (replaced_by_code) via a direct entity
 *     update — RLS scopes this to the owner. The old record is NEVER deleted.
 */
export default function ReplaceDeviceDialog({ open, onClose, device, profile, user, isDark, onSuccess }) {
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";

  const handleReplace = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) { setError("Enter the code printed on your new NFC device."); return; }
    if (device && code === device.device_code?.toUpperCase()) { setError("The new code must be different from the old one."); return; }
    if (!device?.profile_id || !user) { setError("This device has no assigned profile to transfer."); return; }

    setLoading(true); setError("");
    try {
      // 1. Look up the new device
      const lookup = await base44.functions.invoke("getDeviceByCode", { code });
      const newDevice = lookup?.data?.device;
      if (!newDevice) { setError("Device code not found. Check the code on your new card and try again."); setLoading(false); return; }
      if (newDevice.status === "disabled") { setError("The new device has been disabled. Contact support."); setLoading(false); return; }
      if (newDevice.status === "replaced") { setError("The new device has already been replaced."); setLoading(false); return; }
      if (newDevice.id === device.id) { setError("The new code is the same device."); setLoading(false); return; }

      // 2. Activate the new device to the old profile (enforces plan limits)
      const activateRes = await base44.functions.invoke("activateNfcDevice", {
        device_id: newDevice.id,
        profile_id: device.profile_id,
        user_id: user.id,
        user_name: user.full_name,
        profile_name: profile?.display_name,
        old_status: newDevice.status,
      });
      if (activateRes?.data?.error) { setError("Activation failed: " + activateRes.data.error); setLoading(false); return; }

      // 3. Retire the old device (mark replaced — record is kept, never deleted)
      await base44.entities.NFCDevice.update(device.id, {
        status: "replaced",
        replaced_by_code: code,
      });

      setDone(true);
      onSuccess?.();
    } catch (e) {
      setError(e?.message || "Replacement failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewCode(""); setError(""); setDone(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && device && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={handleClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`rounded-3xl p-6 max-w-sm w-full pointer-events-auto ${isDark ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"} shadow-2xl`}
            >
              {done ? (
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                    <CheckCircle className="w-7 h-7 text-cyan-500" />
                  </div>
                  <h2 className={`font-black text-lg ${headText}`}>Device Replaced!</h2>
                  <p className={`text-sm ${mutedText}`}>
                    <span className="font-mono font-bold">{device.device_code}</span> is now retired.
                    Your new device <span className="font-mono font-bold">{newCode.trim().toUpperCase()}</span> is active.
                  </p>
                  <Button onClick={handleClose} className="w-full font-bold rounded-xl" style={{ background: "#FF7A00", color: "#fff" }}>Done</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                      <RefreshCw className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                      <h2 className={`font-black text-lg ${headText}`}>Replace Device</h2>
                      <p className={`text-xs ${mutedText}`}>Retire <span className="font-mono font-bold">{device.device_code}</span> and activate a new card.</p>
                    </div>
                  </div>

                  <div className={`rounded-xl p-3 mb-4 space-y-1.5 text-xs ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <p className={isDark ? "text-white/70" : "text-slate-600"}>Your profile <strong>{profile?.display_name || "—"}</strong> moves to the new device.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className={isDark ? "text-white/70" : "text-slate-600"}>The old device is marked <strong>Replaced</strong> — scans stop, but the record is kept.</p>
                    </div>
                  </div>

                  <label className={`text-xs font-bold block mb-1 ${mutedText}`}>New Device Code</label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl text-sm font-mono outline-none mb-3 ${
                      isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                      : "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-400"
                    }`}
                    placeholder="BG-000001"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && !loading && handleReplace()}
                    autoFocus
                  />

                  {error && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl mb-3 text-xs ${isDark ? "bg-red-500/10 border border-red-500/30 text-red-300" : "bg-red-50 border border-red-200 text-red-600"}`}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} disabled={loading}
                      className={`flex-1 font-bold rounded-xl ${isDark ? "border-white/20 text-white/70 hover:bg-white/10" : ""}`}>Cancel</Button>
                    <Button onClick={handleReplace} disabled={loading}
                      className="flex-1 font-bold rounded-xl text-white" style={{ background: "#06b6d4" }}>
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Replacing…</> : <><RefreshCw className="w-4 h-4 mr-1" /> Replace</>}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}