import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, Mail, MessageSquare, FileText, Shield } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const TOPICS = ["support_topic_account","support_topic_nfc","support_topic_lost","support_topic_billing","support_topic_profile","support_topic_bug","support_topic_privacy","support_topic_other"];

export default function ContactSupport() {
  const { language } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "info.contact@bingooconnect.com",
      subject: `[Support] ${form.topic} — ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\n\nMessage:\n${form.message}`,
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0b2149, #13284f)", padding: "40px 24px 32px", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: 20, textDecoration: "none", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14 }}>
          ← Bingoo Connect
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>{t("support_title",language)}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>{t("support_response_24",language)}</p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 60px" }}>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          {[
            { icon: <Shield size={20} color="#2563eb" />, label: t("legal_privacy",language), desc: t("support_privacy_desc",language), to: "/privacy" },
            { icon: <FileText size={20} color="#7c3aed" />, label: t("legal_terms",language), desc: t("support_terms_desc",language), to: "/terms" },
            { icon: <Mail size={20} color="#dc2626" />, label: t("legal_data_deletion",language), desc: t("support_deletion_desc",language), to: "/data-deletion" },
            { icon: <MessageSquare size={20} color="#059669" />, label: t("support_email_us",language), desc: "info.contact@bingooconnect.com", href: "mailto:info.contact@bingooconnect.com" },
          ].map(({ icon, label, desc, to, href }) => {
            const inner = (
              <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1px solid #e2e8f0", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{desc}</p>
                </div>
              </div>
            );
            if (href) return <a key={label} href={href} style={{ textDecoration: "none" }}>{inner}</a>;
            return <Link key={label} to={to} style={{ textDecoration: "none" }}>{inner}</Link>;
          })}
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={36} color="#059669" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>{t("support_message_sent",language)}</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
              {t("support_thanks",language)} <strong>{form.email}</strong> {t("support_within",language)}
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
              style={{ marginTop: 20, padding: "10px 24px", borderRadius: 999, background: "#0b2149", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
            >
              {t("support_send_another",language)}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>{t("support_send_message",language)}</h2>

            {[
              { label: t("support_your_name",language), key: "name", type: "text", placeholder: t("support_full_name",language) },
              { label: t("support_email_address",language), key: "email", type: "email", placeholder: "your@email.com" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                <input
                  type={type} placeholder={placeholder} required
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("support_topic",language)}</label>
              <select
                value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", background: "#f8fafc" }}
              >
                <option value="">{t("support_select_topic",language)}</option>
                {TOPICS.map(topicKey => <option key={topicKey} value={t(topicKey,"en")}>{t(topicKey,language)}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("contact_message",language)}</label>
              <textarea
                placeholder={t("support_message_detail",language)}
                value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required
                rows={5}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", resize: "vertical", background: "#f8fafc", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !form.name || !form.email || !form.topic || !form.message}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: submitting || !form.name || !form.email || !form.topic || !form.message ? "#94a3b8" : "#0b2149", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {submitting ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {t("support_sending",language)}</> : <><Mail size={18} /> {t("contact_send",language)}</>}
            </button>
          </form>
        )}

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 24, marginTop: 32, display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}>
          {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Data Deletion", "/data-deletion"], ["Contact Support", "/contact-support"]].map(([l, t]) => (
            <Link key={t} to={t} style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>© {new Date().getFullYear()} Bingoo Connect</p>
      </div>
    </div>
  );
}