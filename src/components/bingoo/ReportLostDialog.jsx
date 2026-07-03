import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportLostDialog({
  open,
  onClose,
  onConfirm,
  device,
  isDark,
  isPending,
}) {
  return (
    <AnimatePresence>
      {open && device && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`rounded-3xl p-6 max-w-sm w-full pointer-events-auto ${isDark ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"} shadow-2xl`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <ShieldAlert className="w-7 h-7 text-red-500" />
              </div>

              <h2 className={`text-center font-black text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Activate Lost Mode?
              </h2>
              <p className={`text-center text-sm mb-4 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                Device <span className="font-mono font-bold">{device.device_code}</span>
              </p>

              <div className={`rounded-xl p-3 mb-4 space-y-2 text-xs ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? "text-white/70" : "text-slate-600"}>
                    <strong>Scans will be disabled</strong> — anyone who taps this card will see a recovery page instead of your profile.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? "text-white/70" : "text-slate-600"}>
                    Finders can submit their contact details and GPS location so you can recover your item.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? "text-white/70" : "text-slate-600"}>
                    You can <strong>reactivate anytime</strong> — no data is lost.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className={`flex-1 font-bold rounded-xl ${isDark ? "border-white/20 text-white/70 hover:bg-white/10" : ""}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isPending}
                  className="flex-1 font-bold rounded-xl text-white"
                  style={{ background: "#ef4444" }}
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Activating…</>
                  ) : (
                    <>🔒 Activate Lost Mode</>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}