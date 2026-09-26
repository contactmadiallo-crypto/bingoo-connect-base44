import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinityMark, BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { AccountDropdown } from "@/components/bingoo/WorkspaceSelectors";
import { useAuth } from "@/lib/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { base44 } from "@/api/base44Client";
import HeroPhoneShowcase from "@/components/landing/HeroPhoneShowcase";
import LandingCoreJourney from "@/components/landing/LandingCoreJourney";
import EverythingInOnePlace from "@/components/landing/EverythingInOnePlace";
import LandingVideoTour from "@/components/landing/LandingVideoTour";
import ProfileForEveryProfession from "@/components/landing/ProfileForEveryProfession";
import WhyBingoo from "@/components/landing/WhyBingoo";
import HowSharingWorks from "@/components/landing/HowSharingWorks";
import ProfessionalsLoveBingoo from "@/components/landing/ProfessionalsLoveBingoo";
import AssetProtectionLostMode from "@/components/landing/AssetProtectionLostMode";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingShop from "@/components/landing/LandingShop";
import FeedbackSection from "@/components/bingoo/FeedbackSection";
import LandingFooter from "@/components/landing/LandingFooter";
import BackToTop from "@/components/landing/BackToTop";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const B = { navy: "#0b2149", slate: "#64748b" };

async function goSignIn() {
  const authed = await base44.auth.isAuthenticated();
  if (authed) window.location.href = "/bingoo";
  else base44.auth.redirectToLogin("/bingoo");
}

function LandingAccountMenu({ user, logout }) {
  const { plan } = usePlan();
  return <AccountDropdown user={user} plan={plan} logout={logout} isDark />;
}

export default function LandingV2() {
  const { language } = useI18n();
  const { user, isAuthenticated: authed, logout } = useAuth();
  const navigate = useNavigate();
  const openShop = () => navigate("/shop");

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#071A3D]/95 backdrop-blur-xl" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("landing_home_aria",language)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <InfinityMark size={18} color="#fff" strokeWidth={3.2} glow />
            </div>
            <BingooWordmark size="text-xl" light stacked={false} />
          </Link>
          <div className="hidden items-center gap-7 text-sm font-bold text-white/65 md:flex">
            <a href="#platform" className="transition-colors hover:text-white">{t("landing_platform",language)}</a>
            <a href="#solutions" className="transition-colors hover:text-white">{t("landing_solutions",language)}</a>
            <a href="#pricing" className="transition-colors hover:text-white">{t("landing_pricing",language)}</a>
            <a href="#shop" className="transition-colors hover:text-white">{t("landing_shop",language)}</a>
          </div>
          <div className="flex items-center gap-2">
            {authed && user ? (
              <LandingAccountMenu user={user} logout={logout} />
            ) : (
              <>
                <Button variant="ghost" onClick={goSignIn} className="hidden text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex">{t("landing_sign_in",language)}</Button>
                <Button onClick={goSignIn} className="bg-orange-500 font-black text-white hover:bg-orange-600">{t("landing_create_bingoo",language)}</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden px-4 py-10 sm:py-16 md:px-6 md:py-20 lg:py-24" style={{ background: "radial-gradient(circle at 15% 20%,rgba(249,115,22,.18),transparent 30%),radial-gradient(circle at 85% 30%,rgba(59,130,246,.13),transparent 28%),linear-gradient(145deg,#050A14,#071A3D 48%,#0b2149)" }}>
        <div className="absolute inset-0 opacity-[.045]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px,white 1px,transparent 0)", backgroundSize: "34px 34px" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-400"><Wifi className="h-4 w-4" /> {t("landing_smart_identity",language)}</div>
            <h1 className="max-w-3xl text-[clamp(2.65rem,12vw,4.5rem)] font-black leading-[1.01] tracking-tight text-white sm:text-6xl lg:text-7xl">{t("landing_hero_1",language)}<br /><span className="text-orange-400">{t("landing_hero_2",language)}</span><br />{t("landing_hero_3",language)}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 md:text-xl">{t("landing_hero_copy",language)}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={goSignIn} className="h-14 rounded-xl bg-orange-500 px-7 text-base font-black text-white hover:bg-orange-600">{authed ? t("landing_open_bingoo",language) : t("landing_create_bingoo",language)} <ArrowRight className="ml-2 h-5 w-5" /></Button>
              <Button size="lg" variant="outline" onClick={openShop} className="h-14 rounded-xl border-white/20 bg-white/[.05] px-7 text-base font-black text-white hover:bg-white/10 hover:text-white">{t("landing_shop_devices",language)}</Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-orange-400" /> {t("landing_no_app",language)}</span>
              <span className="flex items-center gap-1.5"><QrCode className="h-4 w-4 text-orange-400" /> {t("landing_nfc_qr",language)}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-orange-400" /> {t("landing_owner_controlled",language)}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .15 }} className="relative">
            <HeroPhoneShowcase />
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-white/10 bg-white/[.06] px-5 py-4 text-center backdrop-blur"><p className="text-sm font-black text-white">{t("landing_flow",language)}</p><p className="mt-1 text-xs text-white/45">{t("landing_flow_copy",language)}</p></div>
          </motion.div>
        </div>
      </header>

      <main>
        <div id="platform" className="scroll-mt-20"><LandingCoreJourney /></div>
        <EverythingInOnePlace />
        <LandingVideoTour />
        <div id="solutions" className="scroll-mt-20"><ProfileForEveryProfession /></div>
        <WhyBingoo />
        <HowSharingWorks />
        <ProfessionalsLoveBingoo />
        <AssetProtectionLostMode />

        <section className="bg-slate-50 px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-9 lg:p-10">
            <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center lg:gap-12">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">{t("landing_physical_digital",language)}</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl" style={{ color: B.navy }}>{t("landing_choose_device",language)}</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>{t("landing_device_copy",language)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6"><p className="font-black" style={{ color: B.navy }}>{t("landing_profile_devices",language)}</p><p className="mt-2 text-sm leading-relaxed text-slate-500">{t("landing_profile_devices_copy",language)}</p></div>
                <div className="rounded-2xl bg-[#071A3D] p-5 text-white shadow-sm md:p-6"><p className="font-black">{t("landing_asset_devices",language)}</p><p className="mt-2 text-sm leading-relaxed text-white/55">{t("landing_asset_devices_copy",language)}</p></div>
              </div>
            </div>
          </div>
        </section>

        <div id="pricing" className="scroll-mt-20"><LandingPricing /></div>
        <div id="shop" className="scroll-mt-20"><LandingShop /></div>
        <FeedbackSection />
        <section className="relative overflow-hidden bg-[#071A3D] px-4 py-16 text-center md:px-6 md:py-20 lg:py-24">
          <div className="absolute inset-0 opacity-[.035]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px,white 1px,transparent 0)", backgroundSize: "34px 34px" }} />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-400">{t("landing_start_connecting",language)}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">{t("landing_next_connection",language)}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">{t("landing_next_copy",language)}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={goSignIn} className="h-14 rounded-xl bg-orange-500 px-8 font-black text-white hover:bg-orange-600">{authed ? t("landing_open_bingoo",language) : t("landing_create_bingoo",language)} <ArrowRight className="ml-2 h-5 w-5" /></Button>
              <Button size="lg" variant="outline" onClick={openShop} className="h-14 rounded-xl border-white/20 bg-white/[.04] px-8 font-black text-white hover:bg-white/10 hover:text-white">{t("landing_shop_devices",language)}</Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
      <BackToTop />
    </div>
  );
}
