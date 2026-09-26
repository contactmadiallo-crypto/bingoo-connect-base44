import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Star, Send, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const TYPES = [
  { value: "suggestion", key: "feedback_suggestion" },
  { value: "compliment", key: "feedback_compliment" },
  { value: "bug", key: "feedback_bug" },
  { value: "other", key: "feedback_other" },
];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${(hover || value) >= s ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackSection() {
  const { language } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", type: "suggestion", message: "", rating: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    await base44.entities.Feedback.create({
      name: form.name,
      email: form.email,
      type: form.type,
      message: form.message,
      rating: form.rating || undefined,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="feedback" className="py-14 md:py-24 px-4 md:px-6 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t("feedback_voice",language)}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">{t("feedback_share_thoughts",language)}</h2>
          <p className="text-slate-500 text-base md:text-lg">{t("feedback_intro",language)}</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-6 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900">{t("feedback_thank_you",language)}</h3>
                <p className="text-slate-500 max-w-sm">{t("feedback_received",language)}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", type: "suggestion", message: "", rating: 0 }); }}
                >
                  {t("feedback_send_another",language)}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Type selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t("feedback_type_question",language)}</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                          form.type === t.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {t(t.key,language)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t("feedback_rate",language)} <span className="text-slate-400 font-normal">{t("feedback_optional",language)}</span></label>
                  <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t("feedback_message",language)} <span className="text-red-400">*</span></label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={t("feedback_message_placeholder",language)}
                    rows={4}
                    required
                    className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none transition-colors"
                  />
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t("feedback_name",language)} <span className="text-slate-400 font-normal">{t("feedback_optional",language)}</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={t("feedback_name_placeholder",language)}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t("feedback_email",language)} <span className="text-slate-400 font-normal">{t("feedback_optional",language)}</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading || !form.message.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-base gap-2 disabled:opacity-50"
                  >
                    {loading ? t("feedback_sending",language) : <><Send className="w-4 h-4" /> {t("feedback_send",language)}</>}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}