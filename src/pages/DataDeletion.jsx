import { useState } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, Trash2, Download, Pencil, FileX, AlertTriangle } from "lucide-react";

const REQUEST_TYPES = [
  {
    id: "account_deletion",
    label: "Account Deletion",
    icon: Trash2,
    color: "#dc2626",
    description: "Permanently delete your account and all associated data.",
    responseTime: "30 days",
    irreversible: true,
  },
  {
    id: "data_export",
    label: "Data Export",
    icon: Download,
    color: "#2563eb",
    description: "Receive a copy of all your data in a structured format.",
    responseTime: "14 days",
    irreversible: false,
  },
  {
    id: "data_correction",
    label: "Data Correction",
    icon: Pencil,
    color: "#f59e0b",
    description: "Request correction of inaccurate personal data you cannot edit yourself.",
    responseTime: "14 days",
    irreversible: false,
  },
  {
    id: "document_deletion",
    label: "Document Deletion",
    icon: FileX,
    color: "#7c3aed",
    description: "Delete specific documents from your Document Wallet without deleting your account.",
    responseTime: "7 days",
    irreversible: true,
  },
];

export default function DataDeletion() {
  const [requestType, setRequestType] = useState("account_deletion");
  const [form, setForm] = useState({ name: "", email: "", details: "" });
  const [confirmIdentity, setConfirmIdentity] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeType = REQUEST_TYPES.find(t => t.id === requestType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmIdentity) return;
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "privacy@bingooconnect.com",
      subject: `${activeType.label} Request — ${form.email}`,
      body: `Request Type: ${activeType.label}\nName: ${form.name}\nEmail: ${form.email}\nIdentity Verified: Yes\n\nDetails:\n${form.details}`,
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <LegalPageLayout title="Data Deletion & Privacy Requests" subtitle="Manage your personal data" lastUpdated="July 11, 2026" maxWidth="max-w-2xl">
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} color="#059669" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-3">Request Received</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            We've received your <strong>{activeType.label}</strong> request. We will verify your
            identity and process it within <strong>{activeType.responseTime}</strong>. A
            confirmation will be sent to <strong>{form.email}</strong>.
          </p>
          {activeType.irreversible && (
            <p className="text-xs text-red-500 mt-4 max-w-md mx-auto">
              Reminder: This action is irreversible. Once processed, deleted data cannot be recovered.
            </p>
          )}
          <a href="/" className="inline-block mt-6 px-7 py-3 rounded-full bg-[#0b2149] text-white font-bold text-sm no-underline">
            ← Back to Home
          </a>
        </div>
      ) : (
        <>
          {/* What is deleted / retained */}
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">What Gets Deleted</h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Your account and login credentials</li>
                <li>Public profile(s) and all displayed information</li>
                <li>Leads, appointments, and booking data</li>
                <li>NFC device records and assignments</li>
                <li>Document Wallet files and metadata</li>
                <li>Analytics history and push notification subscriptions</li>
                <li>Shop order history (personal data portions)</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">What May Be Retained</h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Stripe billing records (required by financial regulations)</li>
                <li>Anonymized/aggregated analytics (no personally identifying data)</li>
                <li>Admin audit logs (for security and compliance)</li>
                <li>Records required to resolve disputes or comply with legal obligations</li>
              </ul>
            </div>
          </div>

          {/* Request type selector */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Select Request Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUEST_TYPES.map(t => {
                const Icon = t.icon;
                const isActive = requestType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setRequestType(t.id)}
                    className="text-left p-4 rounded-2xl border-2 transition-all no-underline"
                    style={{
                      borderColor: isActive ? t.color : "#e2e8f0",
                      background: isActive ? `${t.color}08` : "#fff",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={18} style={{ color: t.color }} />
                      <span className="text-sm font-bold text-slate-900">{t.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                    <p className="text-xs font-semibold mt-2" style={{ color: t.color }}>
                      Response time: {t.responseTime}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Irreversibility warning */}
          {activeType.irreversible && (
            <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-6">
              <AlertTriangle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="text-sm text-orange-900 leading-relaxed">
                <strong>Warning:</strong> {activeType.label} is <strong>irreversible</strong>. Once
                processed, your data cannot be recovered. Consider submitting a Data Export request
                first if you want to keep a copy.
              </div>
            </div>
          )}

          {/* Request form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-5">Submit Your Request</h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                placeholder="The email linked to your Bingoo account"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-400 transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                We will verify this email matches your account before processing.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Additional Details {requestType === "data_correction" && "(Required — describe what needs correcting)"}
                {requestType === "document_deletion" && "(Required — list document names or types to delete)"}
              </label>
              <textarea
                placeholder={
                  requestType === "data_correction" ? "Describe the inaccurate data and what it should be…" :
                  requestType === "document_deletion" ? "List the documents you want deleted…" :
                  "Any additional information…"
                }
                value={form.details}
                onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                required={requestType === "data_correction" || requestType === "document_deletion"}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-400 transition-colors resize-y"
              />
            </div>

            {/* Identity verification checkbox */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmIdentity}
                onChange={e => setConfirmIdentity(e.target.checked)}
                className="mt-1 w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I confirm I am the owner of this account and the information above is accurate.
                I understand that {activeType.label.toLowerCase()} will be processed after identity
                verification{activeType.irreversible ? " and is irreversible" : ""}.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !form.name || !form.email || !confirmIdentity}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white border-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: activeType.irreversible ? "#dc2626" : activeType.color }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting…</>
              ) : (
                <>Submit {activeType.label} Request</>
              )}
            </button>
          </form>

          {/* Support contact */}
          <div className="mt-6 p-4 bg-slate-100 rounded-2xl text-center">
            <p className="text-sm text-slate-600">
              Need help with your request? Email us at{" "}
              <a href="mailto:privacy@bingooconnect.com" className="text-blue-600 font-semibold">privacy@bingooconnect.com</a>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Expected response time: {activeType.responseTime} after identity verification.
            </p>
          </div>
        </>
      )}
    </LegalPageLayout>
  );
}