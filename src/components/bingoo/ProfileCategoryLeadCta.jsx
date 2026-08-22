import { useState } from "react";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProfilePublicCta } from "@/lib/profileCategoryConfig";

export default function ProfileCategoryLeadCta({ profile, color = "#0b2149", track = () => {} }) {
  const cta = getProfilePublicCta(profile);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferred_contact_method: "WhatsApp",
  });

  if (!cta || !profile?.id) return null;

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const openForm = () => {
    track("profile_category_cta_click");
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await base44.functions.invoke("createPublicLead", {
        profile_id: profile.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        preferred_contact_method: form.preferred_contact_method,
        source: `profile_category:${cta.category}`,
      });
      track("profile_category_lead_submitted");
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || err?.data?.error || err?.message || "Could not send your request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ maxWidth: 520, margin: "18px auto 0", padding: "0 16px" }}>
        <button
          type="button"
          onClick={openForm}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 18,
            padding: "14px 18px",
            background: color,
            color: "#fff",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 10px 28px ${color}33`,
          }}
        >
          {cta.label}
          <ArrowRight style={{ width: 17, height: 17 }} />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={cta.formTitle}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 250,
            background: "rgba(2,6,23,0.58)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 24, background: "#fff", padding: 20, boxShadow: "0 24px 80px rgba(2,6,23,.28)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: 20, fontWeight: 900 }}>{cta.formTitle}</h2>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>{cta.formSubtitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>

            {done ? (
              <div style={{ padding: "26px 8px", textAlign: "center" }}>
                <CheckCircle2 style={{ width: 44, height: 44, margin: "0 auto 10px", color: "#16a34a" }} />
                <p style={{ margin: 0, fontWeight: 900, color: "#0f172a", fontSize: 17 }}>Request sent</p>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>Your details were shared with {profile.display_name || "the profile owner"}.</p>
                <button type="button" onClick={() => setOpen(false)} style={{ marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 14, border: "none", background: color, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Done</button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
                <input required placeholder="Your name" value={form.name} onChange={setField("name")} style={inputStyle} />
                <input type="email" placeholder="Email" value={form.email} onChange={setField("email")} style={inputStyle} />
                <input placeholder="Phone / WhatsApp" value={form.phone} onChange={setField("phone")} style={inputStyle} />
                <select value={form.preferred_contact_method} onChange={setField("preferred_contact_method")} style={inputStyle}>
                  <option value="WhatsApp">Prefer WhatsApp</option>
                  <option value="Phone">Prefer Phone</option>
                  <option value="Email">Prefer Email</option>
                </select>
                <textarea required rows={4} placeholder="Tell them what you're looking for..." value={form.message} onChange={setField("message")} style={{ ...inputStyle, resize: "vertical" }} />
                {error && <p style={{ margin: 0, color: "#dc2626", fontSize: 12, fontWeight: 700 }}>{error}</p>}
                <button disabled={saving} type="submit" style={{ marginTop: 2, padding: "13px 16px", borderRadius: 14, border: "none", background: color, color: "#fff", fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.65 : 1 }}>
                  {saving ? "Sending..." : cta.label}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: 13,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
};
