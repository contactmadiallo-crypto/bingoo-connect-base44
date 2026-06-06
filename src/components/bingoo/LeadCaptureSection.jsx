import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function LeadCaptureSection({ profileId, color = "#0B2E6B" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name && !form.phone && !form.email) return;
    setLoading(true);
    await base44.functions.invoke("createPublicLead", { profile_id: profileId, ...form });
    setLoading(false);
    setDone(true);
  };

  const hexRgb = (hex, a = 1) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${hexRgb(color,0.06)}, ${hexRgb(color,0.02)})`, border: `1.5px solid ${hexRgb(color,0.15)}` }}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: hexRgb(color, 0.12) }}>
            🤝
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Stay Connected</h3>
            <p className="text-slate-500 text-xs">Leave your info and we'll reach out</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="text-5xl mb-3">✅</div>
              <h4 className="font-black text-slate-900 text-lg">Got it!</h4>
              <p className="text-slate-500 text-sm mt-1">We'll be in touch soon.</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-3">
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Your Name"
                value={form.name}
                onChange={set("name")}
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Phone Number"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={set("email")}
              />
              <motion.button
                onClick={handleSubmit}
                disabled={loading || (!form.name && !form.phone && !form.email)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${color}, ${hexRgb(color,0.8)})`, boxShadow: `0 8px 24px ${hexRgb(color,0.35)}` }}
              >
                {loading ? "Sending..." : "Send My Information →"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}