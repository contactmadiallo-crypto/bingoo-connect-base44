import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const B = {
  navy: "#0B2E6B",
  navyLight: "#1a4a9e",
  orange: "#FF7A00",
  gold: "#FDBA21",
  slate: "#64748b"
};

/**
 * Reusable documentation-style detail modal for the Landing page.
 * Renders an accessible, keyboard-dismissable overlay with:
 *  - badge, title, overview
 *  - use cases list
 *  - what's implemented list
 *  - why it matters note
 *  - CTA buttons (each navigates to an app route)
 */
export default function LandingDetailModal({ open, onClose, item }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(7,29,71,0.55)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start gap-4 p-6 border-b border-slate-100 bg-white/95 backdrop-blur">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: (item.accent || B.navy) + "15", color: item.accent || B.navy }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                {item.badge && (
                  <span
                    className="inline-block text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5"
                    style={{ background: (item.accent || B.navy) + "15", color: item.accent || B.navy }}>
                    {item.badge}
                  </span>
                )}
                <h3 id="detail-title" className="font-black text-xl leading-tight" style={{ color: B.navy }}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {item.overview && (
                <div>
                  <p className="text-slate-600 leading-relaxed">{item.overview}</p>
                </div>
              )}

              {item.useCases?.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: B.navy }}>
                    How it's used
                  </h4>
                  <ul className="space-y-2">
                    {item.useCases.map((u, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.accent || B.orange }} />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.implemented?.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: B.navy }}>
                    {item.implementedLabel || "What's included today"}
                  </h4>
                  <ul className="space-y-2">
                    {item.implemented.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: B.orange }} />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.futureVision && (
                <div className="rounded-xl p-4" style={{ background: B.gold + "12", border: `1px solid ${B.gold}30` }}>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#b45309" }} />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "#b45309" }}>
                        {item.futureLabel || "Coming next"}
                      </p>
                      <p className="text-sm text-slate-600">{item.futureVision}</p>
                    </div>
                  </div>
                </div>
              )}

              {item.whyItMatters && (
                <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                  <p className="font-bold text-sm mb-1" style={{ color: B.navy }}>Why it matters</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.whyItMatters}</p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {item.ctas?.length > 0 && (
              <div className="sticky bottom-0 z-10 flex flex-wrap gap-2.5 p-5 border-t border-slate-100 bg-white/95 backdrop-blur">
                {item.ctas.map((cta, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 min-w-[140px]">
                    <Button
                      onClick={() => {
                        window.location.href = cta.route;
                      }}
                      className="w-full font-bold"
                      style={{
                        background: i === 0 ? (item.accent || B.orange) : "transparent",
                        color: i === 0 ? "#fff" : B.navy,
                        border: i === 0 ? "none" : `2px solid ${B.navy}20`
                      }}>
                      {cta.label}
                      {i === 0 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}