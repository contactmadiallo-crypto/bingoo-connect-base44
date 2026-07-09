import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, Zap, ArrowRight } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";

const STORAGE_KEY = "bingoo_prospect_closed";
const INTERESTS = ["NFC Card", "Business Profile", "Resume Profile", "Restaurant Menu", "Appointment Booking", "Team Cards"];

function trackProspect(event, profileId) {
  base44.entities.Analytics.create({
    profile_id: profileId,
    event_type: event,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
}

export default function ProspectPopup({ profileId, profileOwnerId, deviceCode, isDemo = false }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState("banner"); // "banner" | "form"
  const [form, setForm] = useState({ name: "", phone: "", email: "", interested_in: "NFC Card" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user-popup"],
    queryFn: () => base44.auth.me().catch(() => null),
    retry: false,
  });

  const isOwner = currentUser && profileOwnerId && currentUser.id === profileOwnerId;

  useEffect(() => {
    if (isDemo || isOwner) return;
    const closed = localStorage.getItem(STORAGE_KEY);
    if (closed && Date.now() - parseInt(closed, 10) < 24 * 60 * 60 * 1000) return;
    const timer = setTimeout(() => {
      setVisible(true);
      if (profileId) trackProspect("prospect_popup_shown", profileId);
    }, 5000);
    return () => clearTimeout(timer);
  }, [profileId, isDemo, isOwner]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleLearnMore = () => {
    if (profileId) trackProspect("prospect_learn_more_clicked", profileId);
    dismiss();
    window.location.href = "/";
  };

  const handleSignup = () => {
    if (profileId) trackProspect("prospect_signup_clicked", profileId);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.functions.invoke("createPublicProspect", {
        source_profile_id: profileId,
        source_device_code: deviceCode || "",
        visitor_name: form.name,
        visitor_email: form.email,
        visitor_phone: form.phone,
        interested_in: form.interested_in,
      });
    } catch (e) {
      // Non-blocking: the prospect may still have been created server-side; continue to register.
      console.error("createPublicProspect failed (non-blocking):", e?.message);
    }
    if (profileId) trackProspect("prospect_lead_submitted", profileId);
    setDone(true);
    setTimeout(() => {
      dismiss();
      const params = new URLSearchParams();
      if (form.email) params.set("email", form.email);
      if (deviceCode) params.set("ref_device", deviceCode);
      if (profileId) params.set("ref_profile", profileId);
      window.location.href = `/register?${params.toString()}`;
    }, 1500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="prospect-popup"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
            padding: "0 12px calc(12px + env(safe-area-inset-bottom))",
          }}
        >
          <div style={{
            maxWidth: 480, margin: "0 auto", borderRadius: 24, overflow: "hidden",
            background: "linear-gradient(145deg, #0b2149 0%, #13284f 100%)",
            boxShadow: "0 -4px 0 rgba(249,115,22,0.6), 0 -20px 60px rgba(11,33,73,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
          }}>
            <div style={{ height: 3, background: "linear-gradient(90deg, #f97316, #FDBA21, #f97316)" }} />

            {step === "banner" && (
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(249,115,22,0.2)", border: "1.5px solid rgba(249,115,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Zap style={{ width: 20, height: 20, color: "#f97316" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                        Want your own smart NFC profile like this?
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                        Share your contact, business & socials with one tap.
                      </p>
                    </div>
                  </div>
                  <button onClick={dismiss} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <button onClick={handleSignup} style={{ padding: "11px 14px", borderRadius: 14, background: "#f97316", border: "none", color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 6px 20px rgba(249,115,22,0.45)" }}>
                    Create Free Profile <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={handleLearnMore} style={{ padding: "11px 14px", borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {step === "form" && !done && (
              <form onSubmit={handleSubmit} style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff" }}>🚀 Get Your Free Profile</p>
                  <button type="button" onClick={dismiss} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                    style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none" }} />
                  <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none" }} />
                </div>
                <input placeholder="Email address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none", marginBottom: 8 }} />
                <MobileSelect
                  value={form.interested_in}
                  onValueChange={(v) => setForm(f => ({ ...f, interested_in: v }))}
                  options={INTERESTS.map(i => ({ value: i, label: i }))}
                  placeholder="Select interest"
                  ariaLabel="Area of interest"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none", marginBottom: 12 }}
                />
                <button type="submit" disabled={saving}
                  style={{ width: "100%", padding: "12px", borderRadius: 14, background: "#f97316", border: "none", color: "#fff", fontWeight: 800, fontSize: 13.5, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 6px 20px rgba(249,115,22,0.4)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : <><span>Create My Free Profile</span><ArrowRight style={{ width: 15, height: 15 }} /></>}
                </button>
              </form>
            )}

            {done && (
              <div style={{ padding: "24px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: 15, margin: "0 0 4px" }}>You're all set!</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Redirecting to create your profile…</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}