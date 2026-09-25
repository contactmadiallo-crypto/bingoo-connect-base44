import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, X, AlertTriangle } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";
import { LEGAL_CATEGORIES, LEGAL_SERVICES, URGENCY_LABELS, CATEGORY_COLORS } from "@/lib/legalData";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const CONTACT_METHODS = ["WhatsApp", "Phone", "Email"];
const RATE_LIMIT_KEY = "bingoo_legal_lead_last_submit";
const RATE_LIMIT_MS = 60_000;

const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors";
const sel = inp + " appearance-none";

function YesNo({ label, value, onChange, language }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-1.5">{label}</p>
      <div className="flex gap-2">
        {["yes", "no"].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${value === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
            {v === "yes" ? `✅ ${t("legal_yes",language)}` : `❌ ${t("legal_no",language)}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LegalIntakeForm({ profileId, color = "#0b2149", isLawFirm = false, source = "profile", deviceCode = null }) {
  const { language } = useI18n();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    preferred_language: "", preferred_contact_method: "WhatsApp",
    legal_category: "", legal_service: "", message: "",
    urgency: "medium", preferred_consult_date: "",
    document_urls: [],
    // immigration
    immigration_a_number: "", immigration_uscis_account: "", immigration_receipt_number: "",
    immigration_case_number: "", immigration_court_date: "", immigration_court_location: "",
    immigration_current_status: "", immigration_process_type: "", immigration_country_of_origin: "",
    immigration_date_of_entry: "", immigration_manner_of_entry: "",
    immigration_prior_asylum: "", immigration_work_permit_status: "",
    immigration_detained: "", immigration_prior_removal: "", immigration_family_petition: "",
    immigration_deadlines: "", immigration_notes: "",
    // civil
    civil_matter_type: "", civil_incident_date: "", civil_incident_location: "",
    civil_opposing_party: "", civil_case_number: "", civil_insurance_claim: "",
    civil_damages_description: "", civil_court_date: "",
    // criminal
    criminal_charge: "", criminal_arrest_date: "", criminal_court_date: "",
    criminal_court_location: "", criminal_docket_number: "", criminal_precinct: "",
    criminal_bail_status: "", criminal_prior_history: "", criminal_detained: "",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, document_urls: [...(f.document_urls || []), file_url] }));
    setUploading(false);
    toast.success(t("intake_doc_uploaded",language));
  };

  const removeDoc = (idx) => setForm(f => ({ ...f, document_urls: f.document_urls.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError(t("intake_err_name",language)); return; }
    if (!form.phone && !form.email) { setError(t("intake_err_contact",language)); return; }
    if (!form.legal_category) { setError(t("intake_err_category",language)); return; }

    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(lastSubmit))) / 1000);
      setError(`${t("intake_wait_prefix",language)} ${remaining}${t("intake_wait_suffix",language)}`);
      return;
    }

    setError("");
    setLoading(true);
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

    await base44.functions.invoke("createPublicLead", {
      profile_id: profileId,
      legal_category: form.legal_category,
      ...form,
      source,
    });

    base44.functions.invoke("trackPublicAnalytics", {
      profile_id: profileId,
      event_type: "lead_submitted",
      visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    }).catch(() => {});

    setLoading(false);
    setDone(true);
    toast.success(t("intake_submitted_toast",language));
  };

  const cat = form.legal_category;
  const catColor = CATEGORY_COLORS[cat] || color;
  const services = LEGAL_SERVICES[cat] || [];

  if (!isLawFirm) return null;

  return (
    <div>
      {!open && !done && (
        <motion.button onClick={() => setOpen(true)} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${color}, #1a4fa0)`, boxShadow: `0 10px 28px rgba(11,33,73,0.35)` }}>
          ⚖️ {t("intake_request_help",language)}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {done && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 rounded-3xl bg-blue-50 border border-blue-100">
            <div className="text-5xl mb-3">✅</div>
            <h4 className="font-black text-slate-900 text-lg">{t("intake_submitted",language)}</h4>
            <p className="text-slate-500 text-sm mt-1 px-4">{t("intake_submitted_copy",language)}</p>
          </motion.div>
        )}

        {open && !done && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
            
            {/* Header */}
            <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${color}, #1a4fa0)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <h3 className="font-black text-base">{t("intake_title",language)}</h3>
                    <p className="text-blue-200 text-xs">{t("intake_confidential_secure",language)}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label={t("intake_close",language)} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:bg-white/30 transition-colors text-sm">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Confidentiality notice */}
              <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>{t("intake_conf_notice",language)}</strong> {t("intake_conf_copy",language)}
                </p>
              </div>

              {/* Basic info */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("intake_your_info",language)}</p>
                <input className={inp} placeholder={t("intake_full_name",language)} value={form.name} onChange={set("name")} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inp} placeholder={t("intake_phone",language)} type="tel" value={form.phone} onChange={set("phone")} />
                  <input className={inp} placeholder={t("intake_email",language)} type="email" value={form.email} onChange={set("email")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inp} placeholder={t("intake_pref_language",language)} value={form.preferred_language} onChange={set("preferred_language")} />
                  <input className={inp} placeholder={t("intake_pref_date",language)} type="date" value={form.preferred_consult_date} onChange={set("preferred_consult_date")} />
                </div>
              </div>

              {/* Contact preference */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{t("intake_contact_method",language)}</p>
                <div className="flex gap-2">
                  {CONTACT_METHODS.map(m => (
                    <button key={m} type="button" onClick={() => setVal("preferred_contact_method", m)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${form.preferred_contact_method === m ? "text-white border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      style={form.preferred_contact_method === m ? { background: color, borderColor: color } : {}}>
                      {m === "WhatsApp" ? "💬" : m === "Phone" ? "📞" : "📧"} {m === "Phone" ? t("intake_phone_method",language) : m === "Email" ? t("intake_email_method",language) : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice category */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("intake_legal_matter",language)}</p>
                <div className="grid grid-cols-3 gap-2">
                  {LEGAL_CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => { setVal("legal_category", c); setVal("legal_service", ""); }}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${form.legal_category === c ? "text-white border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      style={form.legal_category === c ? { background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] } : {}}>
                      {c === "Immigration" ? "🌎" : c === "Civil" ? "⚖️" : "🔒"} {t(`practice_${c.toLowerCase()}`,language)}
                    </button>
                  ))}
                </div>

                {cat && (
                  <MobileSelect
                    value={form.legal_service || "none"}
                    onValueChange={(v) => setVal("legal_service", v === "none" ? "" : v)}
                    options={[
                      { value: "none", label: t("intake_select_service",language) },
                      ...services.map(s => ({ value: s, label: s })),
                    ]}
                    placeholder={t("intake_select_service",language)}
                    ariaLabel={t("intake_select_service",language)}
                    className={inp}
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <MobileSelect
                    value={form.urgency}
                    onValueChange={(v) => setVal("urgency", v)}
                    options={Object.entries(URGENCY_LABELS).map(([k, v]) => ({ value: k, label: `${v.label} Urgency` }))}
                    ariaLabel="Urgency level"
                    className={inp}
                  />
                </div>

                <textarea className={inp + " resize-none"} placeholder={t("intake_describe",language)} rows={3} value={form.message} onChange={set("message")} />
              </div>

              {/* Immigration-specific fields */}
              {cat === "Immigration" && (
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <p className="text-xs font-black text-blue-700 uppercase tracking-wider">{t("legal_immigration_details",language)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "immigration_a_number", p: t("intake_a_number",language) },
                      { k: "immigration_uscis_account", p: t("intake_uscis_account",language) },
                      { k: "immigration_receipt_number", p: t("intake_receipt_number",language) },
                      { k: "immigration_case_number", p: t("intake_case_number",language) },
                      { k: "immigration_court_location", p: t("intake_imm_court_location",language) },
                      { k: "immigration_current_status", p: t("intake_current_status",language) },
                      { k: "immigration_process_type", p: t("intake_process_type",language) },
                      { k: "immigration_country_of_origin", p: t("intake_country_origin",language) },
                      { k: "immigration_manner_of_entry", p: t("intake_manner_entry",language) },
                      { k: "immigration_work_permit_status", p: t("intake_work_permit",language) },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder={t("intake_date_entry",language)} type="date" value={form.immigration_date_of_entry} onChange={set("immigration_date_of_entry")} />
                    <input className={inp} placeholder={t("intake_imm_court_date",language)} type="date" value={form.immigration_court_date} onChange={set("immigration_court_date")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <YesNo language={language} label={t("intake_prior_asylum",language)} value={form.immigration_prior_asylum} onChange={v => setVal("immigration_prior_asylum", v)} />
                    <YesNo language={language} label={t("intake_detained",language)} value={form.immigration_detained} onChange={v => setVal("immigration_detained", v)} />
                    <YesNo language={language} label={t("intake_prior_removal",language)} value={form.immigration_prior_removal} onChange={v => setVal("immigration_prior_removal", v)} />
                    <YesNo language={language} label={t("intake_family_petition",language)} value={form.immigration_family_petition} onChange={v => setVal("immigration_family_petition", v)} />
                  </div>
                  <input className={inp} placeholder={t("intake_deadlines",language)} value={form.immigration_deadlines} onChange={set("immigration_deadlines")} />
                  <textarea className={inp + " resize-none"} placeholder={t("intake_notes_attorney",language)} rows={2} value={form.immigration_notes} onChange={set("immigration_notes")} />
                </div>
              )}

              {/* Civil-specific fields */}
              {cat === "Civil" && (
                <div className="space-y-3 rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                  <p className="text-xs font-black text-purple-700 uppercase tracking-wider">{t("legal_civil_details",language)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "civil_matter_type", p: t("intake_civil_type",language) },
                      { k: "civil_opposing_party", p: t("intake_opposing_party",language) },
                      { k: "civil_case_number", p: t("intake_civil_case",language) },
                      { k: "civil_insurance_claim", p: t("intake_insurance_claim",language) },
                      { k: "civil_incident_location", p: t("intake_incident_location",language) },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder={t("intake_incident_date",language)} type="date" value={form.civil_incident_date} onChange={set("civil_incident_date")} />
                    <input className={inp} placeholder={t("intake_court_deadline",language)} type="date" value={form.civil_court_date} onChange={set("civil_court_date")} />
                  </div>
                  <textarea className={inp + " resize-none"} placeholder={t("intake_damages",language)} rows={2} value={form.civil_damages_description} onChange={set("civil_damages_description")} />
                </div>
              )}

              {/* Criminal-specific fields */}
              {cat === "Criminal" && (
                <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/40 p-4">
                  <p className="text-xs font-black text-red-700 uppercase tracking-wider">{t("legal_criminal_details",language)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "criminal_charge", p: t("intake_charge",language) },
                      { k: "criminal_court_location", p: t("intake_court_location",language) },
                      { k: "criminal_docket_number", p: t("intake_docket",language) },
                      { k: "criminal_precinct", p: t("intake_precinct",language) },
                      { k: "criminal_bail_status", p: t("intake_bail",language) },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder={t("intake_arrest_date",language)} type="date" value={form.criminal_arrest_date} onChange={set("criminal_arrest_date")} />
                    <input className={inp} placeholder={t("intake_court_date",language)} type="date" value={form.criminal_court_date} onChange={set("criminal_court_date")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <YesNo language={language} label={t("intake_prior_history",language)} value={form.criminal_prior_history} onChange={v => setVal("criminal_prior_history", v)} />
                    <YesNo language={language} label={t("intake_detained",language)} value={form.criminal_detained} onChange={v => setVal("criminal_detained", v)} />
                  </div>
                </div>
              )}

              {/* Document upload */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{t("intake_upload_docs",language)}</p>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{uploading ? t("intake_uploading",language) : t("intake_upload_file",language)}</span>
                  <input type="file" className="hidden" onChange={handleDocUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>
                {form.document_urls.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {form.document_urls.map((url, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                        <span className="text-xs text-blue-700 truncate">📎 {t("legal_document",language)} {i + 1}</span>
                        <button type="button" onClick={() => removeDoc(i)} aria-label={t("intake_remove_doc",language)} className="text-red-400 hover:text-red-600 ml-2 flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl">{error}</p>}

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${color}, #1a4fa0)`, boxShadow: `0 8px 24px rgba(11,33,73,0.35)` }}>
                {loading ? t("intake_submitting",language) : `${t("intake_submit",language)} →`}
              </motion.button>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                🔒 {t("intake_footer_notice",language)}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}