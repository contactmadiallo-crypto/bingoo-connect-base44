import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ChevronDown, ChevronUp, Phone, Bell, MapPin, EyeOff, Power } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function LostModeInfoBanner({ isDark }) {
  const [expanded, setExpanded] = useState(false);
  const { language } = useI18n();

  const _text = isDark ? "text-white/80" : "text-slate-700";
  const muted = isDark ? "text-white/50" : "text-slate-500";
  const cardBg = isDark ? "bg-white/5" : "bg-amber-50";
  const border = isDark ? "border-white/10" : "border-amber-200";

  const steps = [
    { icon: Power, color: "#ef4444", title: t("lost_step_scans_title", language), desc: t("lost_step_scans_desc", language) },
    { icon: Phone, color: "#22c55e", title: t("lost_step_contact_title", language), desc: t("lost_step_contact_desc", language) },
    { icon: Bell, color: "#3b82f6", title: t("lost_step_reports_title", language), desc: t("lost_step_reports_desc", language) },
    { icon: MapPin, color: "#a855f7", title: t("lost_step_gps_title", language), desc: t("lost_step_gps_desc", language) },
    { icon: EyeOff, color: "#f59e0b", title: t("lost_step_protected_title", language), desc: t("lost_step_protected_desc", language) },
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
            {t("lost_what_is", language)}
          </p>
          <p className={`text-xs ${muted} mt-0.5`}>
            {t("lost_info_intro", language)}
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
                {t("lost_protections_intro", language)}
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
                ✅ <strong>{t("lost_found_device", language)}</strong> {t("lost_found_device_copy", language)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}