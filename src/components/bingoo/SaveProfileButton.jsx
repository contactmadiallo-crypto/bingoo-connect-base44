import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";

export default function SaveProfileButton({ profile, source = "manual", color = "#0B2E6B" }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);
  const [favId, setFavId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [profile?.id]);

  const checkIfSaved = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed || !profile?.id) { setChecked(true); return; }
    try {
      const existing = await base44.entities.FavoriteProfile.filter({ profile_id: profile.id });
      if (existing.length > 0) {
        setSaved(true);
        setFavId(existing[0].id);
      }
    } catch {}
    setChecked(true);
  };

  const handleToggle = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.href)}`;
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      if (saved && favId) {
        // Unsave
        await base44.entities.FavoriteProfile.delete(favId);
        setSaved(false);
        setFavId(null);
      } else {
        // Save
        const user = await base44.auth.me();
        const record = await base44.entities.FavoriteProfile.create({
          user_id: user.id,
          profile_id: profile.id,
          profile_username: profile.username,
          profile_display_name: profile.display_name,
          profile_job_title: profile.job_title || "",
          profile_company: profile.company_name || "",
          profile_photo: profile.profile_photo || "",
          profile_cover_color: profile.cover_color || "#0B2E6B",
          profile_phone: profile.phone || "",
          profile_email: profile.email || "",
          profile_whatsapp: profile.whatsapp_number || "",
        });
        setSaved(true);
        setFavId(record.id);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  const hexRgb = (hex, alpha = 1) => {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  if (!checked) return null;

  return (
    <>
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        disabled={saving}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "14px 16px", borderRadius: 14,
          background: saved
            ? "linear-gradient(135deg, #ef4444, #dc2626)"
            : `linear-gradient(135deg, ${hexRgb(color, 0.12)}, ${hexRgb(color, 0.06)})`,
          color: saved ? "#fff" : color,
          fontWeight: 800, fontSize: 13.5,
          border: saved ? "none" : `1.5px solid ${hexRgb(color, 0.25)}`,
          cursor: saving ? "wait" : "pointer",
          boxShadow: saved ? "0 6px 20px rgba(239,68,68,0.4)" : "none",
          opacity: saving ? 0.7 : 1,
          transition: "all 0.3s ease",
        }}
      >
        <motion.span
          key={saved ? "filled" : "empty"}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Heart
            size={17}
            fill={saved ? "#fff" : "none"}
            color={saved ? "#fff" : color}
            strokeWidth={2.5}
          />
        </motion.span>
        {saving ? "…" : saved ? "Saved" : "Save Profile"}
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
              zIndex: 200, background: "#ef4444", color: "#fff",
              padding: "12px 24px", borderRadius: 999, fontWeight: 800, fontSize: 14,
              boxShadow: "0 8px 32px rgba(239,68,68,0.5)",
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
            }}
          >
            ❤️ Profile saved! View in My Saved Profiles.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}