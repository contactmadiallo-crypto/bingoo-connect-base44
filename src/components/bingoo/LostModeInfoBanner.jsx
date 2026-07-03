import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ChevronDown, ChevronUp, Phone, Bell, MapPin, EyeOff, Power } from "lucide-react";

export default function LostModeInfoBanner({ isDark }) {
  const [expanded, setExpanded] = useState(false);

  const text = isDark ? "text-white/80" : "text-slate-700";
  const muted = isDark ? "text-white/50" : "text-slate-500";
  const cardBg = isDark ? "bg-white/5" : "bg-amber-50";
  const border = isDark ? "border-white/10" : "border-amber-200";

  const steps = [
    { icon: Power, color: "#ef4444", title: "Scans Are Disabled", desc: "Anyone who taps your lost NFC card will see a recovery page instead of your profile." },
    { icon: Phone, color: "#22c55e", title: "Owner Contact Shown", desc: "If you enabled 'Show phone on lost page', finders can call you directly." },
    { icon: Bell, color: "#3b82f6", title: "Finder Reports", desc: "Finders can submit their name, phone, email, location and a message — you get notified instantly." },
    { icon: MapPin, color: "#a855f7", title: "GPS Location Captured", desc: "If the finder allows it, their approximate GPS coordinates are attached to the report." },
    { icon: EyeOff, color: "#f59e0b", title: "Your Profile Is Protected", desc: "Your private links, payments, and contact details stay hidden until you reactivate." },
  ];

  return (
    <div className={`rounded-2xl overflow-hidden border ${border} ${cardBg}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
            What is Lost Mode?
          </p>
          <p className={`text-xs ${muted} mt-0.5`}>
            Tap to learn how Lost Mode protects your device if it's lost or stolen.
          </p>
        </div>
        {expanded
          ? <ChevronUp className={`w-5 h-5 flex-shrink-0 ${muted}`} />
          : <ChevronDown className={`w-5 h-5 flex-shrink-0 ${muted}`} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 space-y-3">
              <div className={`rounded-xl p-3 text-xs font-medium ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-red-100 border border-red-200 text-red-700"}`}>
                When you activate Lost Mode, the following protections take effect immediately:
              </div>

              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                    <step.icon className="w-4 h-4" style={{ color: step.color }} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${muted} mt-0.5`}>{step.desc}</p>
                  </div>
                </div>
              ))}

              <div className={`rounded-xl p-3 text-xs ${isDark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border border-emerald-200 text-emerald-700"}`}>
                ✅ <strong>Found your device?</strong> Simply tap <strong>Reactivate</strong> on the lost device card to restore normal scanning instantly. No data is lost.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}