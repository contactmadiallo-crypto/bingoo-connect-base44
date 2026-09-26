import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

export default function Contact() {
  const { language } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Feedback.create({
      name: form.name,
      email: form.email,
      message: form.message,
      type: 'other',
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: 'rgba(11,33,73,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> {t("about_back",language)}
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <span className="text-white font-bold">{t("contact_title",language)}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: B.navy }}>
          {t("contact_title",language)}
        </h1>
        <p className="text-slate-500 text-lg mb-12">
          {t("contact_intro",language)}
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: B.navy + '15', color: B.navy }}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">Email</p>
                <a href="mailto:info.contact@bingooconnect.com"
                  className="text-sm hover:underline" style={{ color: B.orange }}>
                  info.contact@bingooconnect.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: B.navy + '15', color: B.navy }}>
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">Instagram</p>
                <a href="https://instagram.com/bingooconnect" target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:underline" style={{ color: B.orange }}>
                  @bingooconnect
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: B.navy + '15', color: B.navy }}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">WhatsApp</p>
                <a href="https://wa.me/message/bingooconnect" target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:underline" style={{ color: B.orange }}>
                  {t("contact_whatsapp",language)}
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-lg" style={{ color: B.navy }}>{t("contact_message_sent",language)}</p>
                <p className="text-slate-500 text-sm mt-1">{t("contact_reply_shortly",language)}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t("contact_name",language)}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder={t("contact_name_ph",language)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t("workspace_email",language)}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t("contact_message",language)}</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    placeholder={t("contact_message_ph",language)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full font-bold"
                  style={{ background: B.orange, color: '#fff', border: 'none' }}>
                  {loading ? t("contact_sending",language) : t("contact_send",language)}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer links */}
      <footer className="border-t mt-16 py-8 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-6">
          <Link to="/" className="hover:text-slate-600 transition-colors">{t("about_home",language)}</Link>
          <Link to="/about" className="hover:text-slate-600 transition-colors">{t("about_about",language)}</Link>
          <Link to="/contact" className="hover:text-slate-600 transition-colors">{t("about_contact",language)}</Link>
          <Link to="/plans" className="hover:text-slate-600 transition-colors">{t("landing_pricing",language)}</Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Bingoo Connect. {t("about_rights",language)}</p>
      </footer>
    </div>
  );
}