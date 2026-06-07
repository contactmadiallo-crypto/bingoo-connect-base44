import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";

export default function DataDeletion() {
  const [form, setForm] = useState({ name: "", email: "", reason: "", details: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "privacy@bingooconnect.com",
      subject: `Data Deletion Request — ${form.email}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nReason: ${form.reason}\n\nDetails:\n${form.details}`,
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", padding: "40px 24px 32px", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png" alt="Bingoo Connect" style={{ height: 28, objectFit: "contain" }} />
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>Data Deletion Request</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Submit a request to delete your personal data</p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={40} color="#059669" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 12px" }}>Request Received</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
              We've received your data deletion request. We will process it within <strong>30 days</strong> and send a confirmation to <strong>{form.email}</strong>.
            </p>
            <Link to="/" style={{ display: "inline-block", marginTop: 24, padding: "12px 28px", borderRadius: 999, background: "#0B2E6B", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Info box */}
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: "16px 20px", marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Trash2 size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: "#9a3412", lineHeight: 1.7 }}>
                  <strong>What gets deleted:</strong> Your account, public profile, leads, appointments, NFC device records, analytics, and all associated personal data. This action is <strong>irreversible</strong>.
                  <br /><br />
                  <strong>What is retained:</strong> Stripe billing records (required by financial regulations) and anonymized analytics.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>Submit Your Request</h2>

              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Your full name", required: true },
                { label: "Email Address", key: "email", type: "email", placeholder: "The email linked to your account", required: true },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason for Deletion</label>
                <select
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", background: "#f8fafc" }}
                >
                  <option value="">Select a reason…</option>
                  <option value="no_longer_using">No longer using the service</option>
                  <option value="privacy_concerns">Privacy concerns</option>
                  <option value="switching_provider">Switching to another provider</option>
                  <option value="gdpr_request">GDPR / legal right to erasure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Additional Details (Optional)</label>
                <textarea
                  placeholder="Any additional information…"
                  value={form.details}
                  onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                  rows={4}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", resize: "vertical", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !form.name || !form.email || !form.reason}
                style={{ width: "100%", padding: "14px", borderRadius: 12, background: submitting || !form.name || !form.email || !form.reason ? "#94a3b8" : "#dc2626", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {submitting ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</> : <><Trash2 size={18} /> Submit Deletion Request</>}
              </button>

              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
                By submitting this form, you confirm you are the account owner. We will verify your identity before processing the request.
              </p>
            </form>
          </>
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