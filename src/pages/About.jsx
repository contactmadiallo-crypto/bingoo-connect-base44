import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

export default function About() {
  const { language } = useI18n();
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
          <span className="text-white font-bold">{t("about_title",language)}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ color: B.navy }}>
          {t("about_title",language)}
        </h1>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-6">
          <p>
            {t("about_p1",language)}
          </p>

          <p>
            {t("about_p2",language)}
          </p>

          <p>
            {t("about_p3",language)}
          </p>

          <p>
            {t("about_p4",language)}
          </p>

          <p>
            {t("about_p5",language)}
          </p>

          <div className="flex gap-4 mt-10">
            <Link to="/plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white"
              style={{ background: B.orange }}>
              {t("about_view_plans",language)}
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold border-2"
              style={{ color: B.navy, borderColor: B.navy }}>
              {t("about_contact_us",language)}
            </Link>
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