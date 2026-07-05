import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, X, AlertTriangle } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";
import { LEGAL_CATEGORIES, LEGAL_SERVICES, URGENCY_LABELS, CATEGORY_COLORS } from "@/lib/legalData";

const CONTACT_METHODS = ["WhatsApp", "Phone", "Email"];
const RATE_LIMIT_KEY = "bingoo_legal_lead_last_submit";
const RATE_LIMIT_MS = 60_000;

const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors";
const sel = inp + " appearance-none";

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-1.5">{label}</p>
      <div className="flex gap-2">
        {["yes", "no"].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${value === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
            {v === "yes" ? "✅ Yes" : "❌ No"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LegalIntakeForm({ profileId, color = "#0B2E6B", isLawFirm = false }) {
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
    toast.success("Document uploaded");
  };

  const removeDoc = (idx) => setForm(f => ({ ...f, document_urls: f.document_urls.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError("Please enter your name."); return; }
    if (!form.phone && !form.email) { setError("Please enter a phone number or email."); return; }
    if (!form.legal_category) { setError("Please select a practice category."); return; }

    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(lastSubmit))) / 1000);
      setError(`Please wait ${remaining}s before submitting again.`);
      return;
    }

    setError("");
    setLoading(true);
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

    await base44.functions.invoke("createPublicLead", { profile_id: profileId, legal_category: form.legal_category, ...form });

    base44.entities.Analytics.create({
      profile_id: profileId,
      event_type: "lead_submitted",
      visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      created_at: new Date().toISOString(),
    }).catch(() => {});

    setLoading(false);
    setDone(true);
    toast.success("Your legal request has been submitted!");
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
          style={{ background: `linear-gradient(135deg, ${color}, #1a4fa0)`, boxShadow: `0 10px 28px rgba(11,46,107,0.35)` }}>
          ⚖️ Request Legal Help
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {done && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 rounded-3xl bg-blue-50 border border-blue-100">
            <div className="text-5xl mb-3">✅</div>
            <h4 className="font-black text-slate-900 text-lg">Request Submitted!</h4>
            <p className="text-slate-500 text-sm mt-1 px-4">A legal representative will contact you soon. Submitting this form does not create an attorney-client relationship.</p>
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
                    <h3 className="font-black text-base">Legal Consultation Request</h3>
                    <p className="text-blue-200 text-xs">Confidential & Secure</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close form" className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:bg-white/30 transition-colors text-sm">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Confidentiality notice */}
              <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Confidentiality Notice:</strong> Submitting this form does not create an attorney-client relationship. A legal representative must confirm representation separately.
                </p>
              </div>

              {/* Basic info */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Your Information</p>
                <input className={inp} placeholder="Full Name *" value={form.name} onChange={set("name")} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inp} placeholder="Phone Number" type="tel" value={form.phone} onChange={set("phone")} />
                  <input className={inp} placeholder="Email Address" type="email" value={form.email} onChange={set("email")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inp} placeholder="Preferred Language" value={form.preferred_language} onChange={set("preferred_language")} />
                  <input className={inp} placeholder="Preferred Consult Date" type="date" value={form.preferred_consult_date} onChange={set("preferred_consult_date")} />
                </div>
              </div>

              {/* Contact preference */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Preferred Contact Method</p>
                <div className="flex gap-2">
                  {CONTACT_METHODS.map(m => (
                    <button key={m} type="button" onClick={() => setVal("preferred_contact_method", m)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${form.preferred_contact_method === m ? "text-white border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      style={form.preferred_contact_method === m ? { background: color, borderColor: color } : {}}>
                      {m === "WhatsApp" ? "💬" : m === "Phone" ? "📞" : "📧"} {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice category */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Legal Matter</p>
                <div className="grid grid-cols-3 gap-2">
                  {LEGAL_CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => { setVal("legal_category", c); setVal("legal_service", ""); }}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${form.legal_category === c ? "text-white border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      style={form.legal_category === c ? { background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] } : {}}>
                      {c === "Immigration" ? "🌎" : c === "Civil" ? "⚖️" : "🔒"} {c}
                    </button>
                  ))}
                </div>

                {cat && (
                  <MobileSelect
                    value={form.legal_service || "none"}
                    onValueChange={(v) => setVal("legal_service", v === "none" ? "" : v)}
                    options={[
                      { value: "none", label: "-- Select Service Needed --" },
                      ...services.map(s => ({ value: s, label: s })),
                    ]}
                    placeholder="-- Select Service Needed --"
                    ariaLabel="Legal service needed"
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

                <textarea className={inp + " resize-none"} placeholder="Briefly describe your legal situation…" rows={3} value={form.message} onChange={set("message")} />
              </div>

              {/* Immigration-specific fields */}
              {cat === "Immigration" && (
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Immigration Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "immigration_a_number", p: "A-Number (Alien Number)" },
                      { k: "immigration_uscis_account", p: "USCIS Online Account #" },
                      { k: "immigration_receipt_number", p: "Receipt Number" },
                      { k: "immigration_case_number", p: "Case Number" },
                      { k: "immigration_court_location", p: "Immigration Court Location" },
                      { k: "immigration_current_status", p: "Current Immigration Status" },
                      { k: "immigration_process_type", p: "Type of Immigration Process" },
                      { k: "immigration_country_of_origin", p: "Country of Origin" },
                      { k: "immigration_manner_of_entry", p: "Manner of Entry" },
                      { k: "immigration_work_permit_status", p: "Work Permit Status" },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder="Date of Entry to U.S." type="date" value={form.immigration_date_of_entry} onChange={set("immigration_date_of_entry")} />
                    <input className={inp} placeholder="Immigration Court Date" type="date" value={form.immigration_court_date} onChange={set("immigration_court_date")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <YesNo label="Prior Asylum Application?" value={form.immigration_prior_asylum} onChange={v => setVal("immigration_prior_asylum", v)} />
                    <YesNo label="Currently Detained?" value={form.immigration_detained} onChange={v => setVal("immigration_detained", v)} />
                    <YesNo label="Prior Removal / Deportation Order?" value={form.immigration_prior_removal} onChange={v => setVal("immigration_prior_removal", v)} />
                    <YesNo label="Family Petition Pending?" value={form.immigration_family_petition} onChange={v => setVal("immigration_family_petition", v)} />
                  </div>
                  <input className={inp} placeholder="Important Deadlines" value={form.immigration_deadlines} onChange={set("immigration_deadlines")} />
                  <textarea className={inp + " resize-none"} placeholder="Additional notes for attorney…" rows={2} value={form.immigration_notes} onChange={set("immigration_notes")} />
                </div>
              )}

              {/* Civil-specific fields */}
              {cat === "Civil" && (
                <div className="space-y-3 rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                  <p className="text-xs font-black text-purple-700 uppercase tracking-wider">Civil Matter Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "civil_matter_type", p: "Type of Civil Matter" },
                      { k: "civil_opposing_party", p: "Opposing Party Name (if known)" },
                      { k: "civil_case_number", p: "Court Case Number (if any)" },
                      { k: "civil_insurance_claim", p: "Insurance Claim Number (if any)" },
                      { k: "civil_incident_location", p: "Location of Incident" },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder="Date of Incident" type="date" value={form.civil_incident_date} onChange={set("civil_incident_date")} />
                    <input className={inp} placeholder="Court / Deadline Date" type="date" value={form.civil_court_date} onChange={set("civil_court_date")} />
                  </div>
                  <textarea className={inp + " resize-none"} placeholder="Describe injury or damages…" rows={2} value={form.civil_damages_description} onChange={set("civil_damages_description")} />
                </div>
              )}

              {/* Criminal-specific fields */}
              {cat === "Criminal" && (
                <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/40 p-4">
                  <p className="text-xs font-black text-red-700 uppercase tracking-wider">Criminal Matter Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "criminal_charge", p: "Charge or Accusation" },
                      { k: "criminal_court_location", p: "Court Location" },
                      { k: "criminal_docket_number", p: "Docket / Case Number" },
                      { k: "criminal_precinct", p: "Police Precinct (if known)" },
                      { k: "criminal_bail_status", p: "Bail Status" },
                    ].map(({ k, p }) => (
                      <input key={k} className={inp} placeholder={p} value={form[k]} onChange={set(k)} />
                    ))}
                    <input className={inp} placeholder="Arrest Date" type="date" value={form.criminal_arrest_date} onChange={set("criminal_arrest_date")} />
                    <input className={inp} placeholder="Court Date" type="date" value={form.criminal_court_date} onChange={set("criminal_court_date")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <YesNo label="Prior Criminal History?" value={form.criminal_prior_history} onChange={v => setVal("criminal_prior_history", v)} />
                    <YesNo label="Currently Detained?" value={form.criminal_detained} onChange={v => setVal("criminal_detained", v)} />
                  </div>
                </div>
              )}

              {/* Document upload */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Upload Documents (optional)</p>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{uploading ? "Uploading…" : "Upload a document or evidence file"}</span>
                  <input type="file" className="hidden" onChange={handleDocUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>
                {form.document_urls.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {form.document_urls.map((url, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                        <span className="text-xs text-blue-700 truncate">📎 Document {i + 1}</span>
                        <button type="button" onClick={() => removeDoc(i)} aria-label="Remove document" className="text-red-400 hover:text-red-600 ml-2 flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl">{error}</p>}

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${color}, #1a4fa0)`, boxShadow: `0 8px 24px rgba(11,46,107,0.35)` }}>
                {loading ? "Submitting…" : "Submit Legal Request →"}
              </motion.button>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                🔒 Submitting this form does not create an attorney-client relationship. All information is kept strictly confidential.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}