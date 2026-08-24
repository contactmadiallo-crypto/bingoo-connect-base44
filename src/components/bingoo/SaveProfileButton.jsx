import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function SaveProfileButton({ profile, source = "manual", color = "#0b2149", buttonStyle = "pill" }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [profile?.id]);

  const checkIfSaved = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed || !profile?.id) { setChecked(true); return; }
    try {
      const existing = await base44.entities.SavedConnection.filter({ profile_id: profile.id });
      setSaved(existing.length > 0);
    } catch {}
    setChecked(true);
  };

  const handleSave = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.href)}`;
      return;
    }
    if (saved || saving) return;
    setSaving(true);
    try {
      await base44.entities.SavedConnection.create({
        profile_id: profile.id,
        profile_username: profile.username,
        profile_display_name: profile.display_name,
        profile_job_title: profile.job_title || "",
        profile_company: profile.company_name || "",
        profile_photo: profile.profile_photo || "",
        profile_cover_color: profile.cover_color || "#0b2149",
        profile_phone: profile.phone || "",
        profile_email: profile.email || "",
        profile_whatsapp: profile.whatsapp_number || "",
        source,
      });
      setSaved(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {}
    setSaving(false);
  };

  const hexRgb = (hex, alpha = 1) => {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  if (!checked) return null;

  const radius = buttonStyle === "pill" ? 999 : buttonStyle === "rounded" ? 14 : buttonStyle === "sharp" ? 6 : buttonStyle === "flat" ? 8 : 14;
  const outlined = buttonStyle === "outlined";
  const flat = buttonStyle === "flat";

  return (
    <>
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: saved ? 1 : 1.03, y: saved ? 0 : -2 }}
        whileTap={{ scale: 0.97 }}
        disabled={saved || saving}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "13px 10px", borderRadius: radius,
          background: saved
            ? "linear-gradient(135deg, #10b981, #059669)"
            : outlined ? "transparent" : flat ? color : `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
          color: saved ? "#fff" : outlined ? color : "#fff", fontWeight: 800, fontSize: 13.5,
          border: saved ? "none" : outlined ? `2px solid ${color}` : "none", cursor: saved ? "default" : "pointer",
          boxShadow: saved ? "0 6px 20px rgba(16,185,129,0.4)" : (outlined || flat ? "none" : `0 6px 20px ${hexRgb(color, 0.4)}`),
          opacity: saving ? 0.7 : 1,
          transition: "all 0.3s ease",
        }}
      >
        <span style={{ fontSize: 16 }}>{saved ? "✅" : saving ? "⏳" : "🤝"}</span>
        {saved ? "Connected!" : saving ? "Saving…" : "Save Profile"}
      </motion.button>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
              zIndex: 200, background: "#10b981", color: "#fff",
              padding: "12px 24px", borderRadius: 999, fontWeight: 800, fontSize: 14,
              boxShadow: "0 8px 32px rgba(16,185,129,0.5)",
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
            }}
          >
            🤝 Profile saved to your connections!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}