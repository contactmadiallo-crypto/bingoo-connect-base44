import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSelect } from "@/components/ui/mobile-select";
import { base44 } from "@/api/base44Client";

/**
 * ReassignDeviceDialog — user-facing flow to move an NFC device from one owned
 * profile to another. Uses a direct entity update (RLS scopes the update to
 * devices whose profile_id is in the owner's owned_profile_ids). No backend
 * function changes.
 */
export default function ReassignDeviceDialog({ open, onClose, device, profiles, isDark, onSuccess }) {
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";

  // Reset the default target whenever the dialog opens or the device changes
  useEffect(() => {
    if (open) {
      const elig = (profiles || []).filter(p => p.id !== device?.profile_id);
      setTargetId(elig[0]?.id || "");
      setError("");
    }
  }, [open, device?.id, profiles]);

  const eligible = (profiles || []).filter(p => p.id !== device?.profile_id);

  const handleReassign = async () => {
    if (!targetId) { setError("Select a profile to reassign to."); return; }
    if (!device) { setError("No device selected."); return; }
    setLoading(true); setError("");
    try {
      await base44.entities.NFCDevice.update(device.id, {
        profile_id: targetId,
        assigned_at: new Date().toISOString(),
      });
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Reassignment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setError(""); onClose?.(); };

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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className={`font-black text-lg ${headText}`}>Reassign Device</h2>
                  <p className={`text-xs ${mutedText}`}>Move <span className="font-mono font-bold">{device.device_code}</span> to another profile.</p>
                </div>
              </div>

              {eligible.length === 0 ? (
                <div className={`rounded-xl p-4 text-sm ${isDark ? "bg-white/5 border border-white/10 text-white/60" : "bg-slate-50 border border-slate-200 text-slate-600"}`}>
                  You need another profile to reassign this device. Create a new profile first, then come back here.
                </div>
              ) : (
                <>
                  <label className={`text-xs font-bold block mb-1 ${mutedText}`}>Target Profile</label>
                  <div className="mb-4">
                    <MobileSelect
                      value={targetId}
                      onValueChange={setTargetId}
                      placeholder="— Select a profile —"
                      ariaLabel="Reassign to profile"
                      options={eligible.map(p => ({ value: p.id, label: `${p.display_name} (@${p.username})` }))}
                      className="w-full rounded-xl text-sm"
                      style={isDark ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" } : {}}
                    />
                  </div>

                  {error && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl mb-3 text-xs ${isDark ? "bg-red-500/10 border border-red-500/30 text-red-300" : "bg-red-50 border border-red-200 text-red-600"}`}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} disabled={loading}
                      className={`flex-1 font-bold rounded-xl ${isDark ? "border-white/20 text-white/70 hover:bg-white/10" : ""}`}>Cancel</Button>
                    <Button onClick={handleReassign} disabled={loading || !targetId}
                      className="flex-1 font-bold rounded-xl text-white" style={{ background: "#a855f7" }}>
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Moving…</> : <><ArrowRightLeft className="w-4 h-4 mr-1" /> Reassign</>}
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