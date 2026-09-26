import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandLockup from "@/components/auth/BrandLockup";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const ORANGE = "#f97316";

// Top navigation bar for auth pages — white background, brand lockup left,
// marketing links center (desktop), Log In + Get Started CTA right.
export default function AuthTopNav({ loginHref = "/login" }) {
  const { language } = useI18n();
  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center flex-shrink-0" aria-label={t("auth_home_aria",language)}>
          <BrandLockup badgeSize={32} />
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link to="/shop" className="hover:text-slate-900 transition-colors">{t("auth_products",language)}</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">{t("auth_templates",language)}</Link>
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">{t("auth_pricing",language)}</Link>
          <Link to="/plans" className="hover:text-slate-900 transition-colors">{t("auth_for_business",language)}</Link>
          <Link to="/about" className="hover:text-slate-900 transition-colors">{t("auth_about",language)}</Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Link
            to={loginHref}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors hidden sm:inline"
          >
            {t("auth_login",language)}
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: ORANGE }}
          >
            {t("auth_get_started",language)} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}