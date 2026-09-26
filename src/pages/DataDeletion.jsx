import { useState } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, Trash2, Download, Pencil, FileX, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const REQUEST_TYPES = [
  {
    id: "account_deletion",
    labelKey: "data_type_account",
    icon: Trash2,
    color: "#dc2626",
    descriptionKey: "data_type_account_desc",
    responseTimeKey: "data_days_30",
    irreversible: true,
  },
  {
    id: "data_export",
    labelKey: "data_type_export",
    icon: Download,
    color: "#2563eb",
    descriptionKey: "data_type_export_desc",
    responseTimeKey: "data_days_14",
    irreversible: false,
  },
  {
    id: "data_correction",
    labelKey: "data_type_correction",
    icon: Pencil,
    color: "#f59e0b",
    descriptionKey: "data_type_correction_desc",
    responseTimeKey: "data_days_14",
    irreversible: false,
  },
  {
    id: "document_deletion",
    labelKey: "data_type_document",
    icon: FileX,
    color: "#7c3aed",
    descriptionKey: "data_type_document_desc",
    responseTimeKey: "data_days_7",
    irreversible: true,
  },
];

export default function DataDeletion() {
  const { language } = useI18n();
  const [requestType, setRequestType] = useState("account_deletion");
  const [form, setForm] = useState({ name: "", email: "", details: "" });
  const [confirmIdentity, setConfirmIdentity] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activeType = REQUEST_TYPES.find(t => t.id === requestType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmIdentity) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await base44.functions.invoke("submitPrivacyRequest", {
        request_type: requestType,
        email: form.email,
        full_name: form.name,
        details: form.details,
      });
      if (response?.data?.error) throw new Error(response.data.error);
      setSubmitted(true);
    } catch (error) {
      console.error("Privacy request failed:", error);
      setSubmitError(error?.message || t("data_submit_error",language));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalPageLayout title={t("data_title",language)} subtitle={t("data_subtitle",language)} lastUpdated="July 11, 2026" maxWidth="max-w-2xl">
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} color="#059669" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-3">{t("data_request_received",language)}</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            {t("data_received_prefix",language)} <strong>{t(activeType.labelKey,language)}</strong>{t("data_received_mid",language)} <strong>{t(activeType.responseTimeKey,language)}</strong>. {t("data_received_suffix",language)} <strong>{form.email}</strong>.
          </p>
          {activeType.irreversible && (
            <p className="text-xs text-red-500 mt-4 max-w-md mx-auto">
              {t("data_irreversible_reminder",language)}
            </p>
          )}
          <a href="/" className="inline-block mt-6 px-7 py-3 rounded-full bg-[#0b2149] text-white font-bold text-sm no-underline">
            ← {t("data_back_home",language)}
          </a>
        </div>
      ) : (
        <>
          {/* What is deleted / retained */}
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t("data_deleted_title",language)}</h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>{t("data_del_account",language)}</li>
                <li>{t("data_del_profiles",language)}</li>
                <li>{t("data_del_leads",language)}</li>
                <li>{t("data_del_nfc",language)}</li>
                <li>{t("data_del_wallet",language)}</li>
                <li>{t("data_del_analytics",language)}</li>
                <li>{t("data_del_orders",language)}</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t("data_retained_title",language)}</h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>{t("data_keep_stripe",language)}</li>
                <li>{t("data_keep_analytics",language)}</li>
                <li>{t("data_keep_audit",language)}</li>
                <li>{t("data_keep_legal",language)}</li>
              </ul>
            </div>
          </div>

          {/* Request type selector */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">{t("data_select_type",language)}</h3>
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
                      <span className="text-sm font-bold text-slate-900">{t(t.labelKey,language)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(t.descriptionKey,language)}</p>
                    <p className="text-xs font-semibold mt-2" style={{ color: t.color }}>
                      {t("data_response_time",language)} {t(t.responseTimeKey,language)}
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
                <strong>{t("data_warning",language)}</strong> {t(activeType.labelKey,language)} {t("data_warning_copy",language)}
              </div>
            </div>
          )}

          {/* Request form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900 mb-5">{t("data_submit_title",language)}</h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{t("data_full_name",language)}</label>
              <input
                type="text"
                placeholder={t("data_full_name_ph",language)}
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{t("data_email",language)}</label>
              <input
                type="email"
                placeholder={t("data_email_ph",language)}
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-400 transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {t("data_email_verify",language)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                {t("data_details",language)} {requestType === "data_correction" && t("data_details_correction",language)}
                {requestType === "document_deletion" && t("data_details_document",language)}
              </label>
              <textarea
                placeholder={
                  requestType === "data_correction" ? t("data_ph_correction",language) :
                  requestType === "document_deletion" ? t("data_ph_document",language) :
                  t("data_ph_other",language)
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
                {t("data_identity_prefix",language)} {t(activeType.labelKey,language).toLowerCase()} {t("data_identity_suffix",language)}{activeType.irreversible ? ` ${t("data_and_irreversible",language)}` : ""}.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !form.name || !form.email || !confirmIdentity}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white border-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: activeType.irreversible ? "#dc2626" : activeType.color }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> {t("data_submitting",language)}</>
              ) : (
                <>{t("data_submit",language)} {t(activeType.labelKey,language)} {t("data_request",language)}</>
              )}
            </button>
          </form>

          {/* Support contact */}
          <div className="mt-6 p-4 bg-slate-100 rounded-2xl text-center">
            <p className="text-sm text-slate-600">
              {t("data_help",language)}{" "}
              <a href="mailto:privacy@bingooconnect.com" className="text-blue-600 font-semibold">privacy@bingooconnect.com</a>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t("data_expected",language)} {t(activeType.responseTimeKey,language)} {t("data_after_verification",language)}
            </p>
          </div>
        </>
      )}
    </LegalPageLayout>
  );
}