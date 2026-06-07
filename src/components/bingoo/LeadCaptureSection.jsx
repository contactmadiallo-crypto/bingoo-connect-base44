import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const hexRgb = (hex, a = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

const CONTACT_METHODS = ["WhatsApp", "Phone", "Email"];

const RATE_LIMIT_KEY = "bingoo_lead_last_submit";
const RATE_LIMIT_MS = 60_000; // 60 seconds

export default function LeadCaptureSection({ profileId, color = "#0B2E6B" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", preferred_contact: "WhatsApp" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError("Please enter your name."); return; }
    if (!form.phone && !form.email) { setError("Please enter a phone number or email."); return; }

    // Rate limiting check
    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(lastSubmit))) / 1000);
      setError(`Please wait ${remaining}s before submitting again.`);
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), remaining * 1000);
      return;
    }

    setError("");
    setLoading(true);
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    await base44.functions.invoke("createPublicLead", {
      profile_id: profileId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      message: form.message,
      preferred_contact_method: form.preferred_contact,
    });
    base44.entities.Analytics.create({
      profile_id: profileId,
      event_type: "lead_submitted",
      visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      created_at: new Date().toISOString(),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
    toast.success("Your request has been sent successfully!");
  };

  return (
    <div>
      {/* Request Info Button */}
      {!open && !done && (
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`, boxShadow: `0 10px 28px ${hexRgb(color, 0.35)}` }}
        >
          🤝 Request Info
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 rounded-3xl"
            style={{ background: hexRgb(color, 0.06), border: `1.5px solid ${hexRgb(color, 0.15)}` }}
          >
            <div className="text-5xl mb-3">✅</div>
            <h4 className="font-black text-slate-900 text-lg">Request Sent!</h4>
            <p className="text-slate-500 text-sm mt-1">Your request has been sent successfully.</p>
          </motion.div>
        )}

        {open && !done && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: hexRgb(color, 0.04), border: `1.5px solid ${hexRgb(color, 0.15)}` }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤝</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Request Info</h3>
                    <p className="text-slate-500 text-xs">We'll get back to you soon</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors text-sm">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Full Name *"
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
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:border-blue-400 transition-colors resize-none"
                  placeholder="Message (optional)"
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                />

                {/* Preferred Contact */}
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Preferred Contact Method</p>
                  <div className="flex gap-2">
                    {CONTACT_METHODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, preferred_contact: m }))}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border"
                        style={form.preferred_contact === m
                          ? { background: color, color: "#fff", borderColor: color }
                          : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }
                        }
                      >
                        {m === "WhatsApp" ? "💬" : m === "Phone" ? "📞" : "📧"} {m}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl">{error}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`, boxShadow: `0 8px 24px ${hexRgb(color, 0.35)}` }}
                >
                  {loading ? "Sending..." : "Send Request →"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}