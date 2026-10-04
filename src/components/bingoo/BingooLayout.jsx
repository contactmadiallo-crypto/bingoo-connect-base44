import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Shield, X, Sun, Moon, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { useNavBadges } from "@/hooks/useNavBadges";
import { getVisibleNavSections, normalizeSidebarPlan } from "@/lib/sidebarConfigV2";
import BottomNav from "@/components/mobile/BottomNav";
import { t } from "@/lib/i18n";
import BingooLogo from "@/components/bingoo/BingooLogo";
import { BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { isAdminUser } from "@/lib/auth";
import BrandLockup from "@/components/auth/BrandLockup";
import { AccountDropdown } from "@/components/bingoo/WorkspaceSelectors";
import NotificationCenter from "@/components/bingoo/NotificationCenter";
import { useProfileWorkspace } from "@/lib/ProfileWorkspaceContext";
import { usePlan } from "@/hooks/usePlan";
import { useI18n } from "@/lib/I18nContext";

const PLAN_LABELS = {
  free: "FREE",
  professional: "PRO",
  business: "BUSINESS",
  salon: "SALON",
  restaurant: "RESTAURANT",
  lawfirm: "LAW FIRM",
  corporate: "CORPORATE",
};

export default function BingooLayout({ children, selectedProfile: selectedProfileProp, accountPlan: accountPlanProp, userId }) {
  const location = useLocation();
  // Single source of truth for the UI language (also persisted to User.preferred_language).
  const { language: lang, setLanguage } = useI18n();
  const toggleLanguage = () => setLanguage(lang === "fr" ? "en" : "fr");
  const desktopNavRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("bingoo_sidebar_collapsed") === "1");
  const { isDark, toggle } = useBingooTheme();

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);

  useEffect(() => {
    localStorage.setItem("bingoo_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  const { user, logout } = useAuth();
  const { selectedProfile: workspaceProfile } = useProfileWorkspace();
  const { plan: resolvedAccountPlan } = usePlan();
  const selectedProfile = selectedProfileProp !== undefined ? selectedProfileProp : workspaceProfile;
  const accountPlan = normalizeSidebarPlan(accountPlanProp || resolvedAccountPlan || "free");
  const effectiveUserId = userId || user?.id;
  const isAdmin = isAdminUser(user);
  const navSections = getVisibleNavSections({ ...(selectedProfile || {}), owner_email: user?.email }, isAdmin, lang, accountPlan);
  const mobileMenuSections = navSections
    .map(section => ({ ...section, items: section.items.filter(item => !["profiles", "devices", "shop"].includes(item.id)) }))
    .filter(section => section.items.length > 0);
  const { badgeMap } = useNavBadges(effectiveUserId, selectedProfile?.id);

  // Keep the selected item visible inside the sidebar itself after every route change.
  // Using the sidebar scroll container directly is more reliable than scrollIntoView,
  // especially for standalone routes such as /my-nfc-devices and long Lost Mode menus.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nav = desktopNavRef.current;
      if (!nav) return;
      const active = nav.querySelector('[aria-current="page"]');
      if (!active) return;

      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const topGuard = navRect.top + 24;
      const bottomGuard = navRect.bottom - 24;

      if (activeRect.top < topGuard || activeRect.bottom > bottomGuard) {
        const target = nav.scrollTop + (activeRect.top - navRect.top) - (nav.clientHeight / 2) + (activeRect.height / 2);
        nav.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, sidebarCollapsed, accountPlan]);

  const sidebarBg = "linear-gradient(180deg, rgba(6,26,56,0.96) 0%, rgba(4,26,54,0.96) 52%, rgba(3,22,47,0.98) 100%)";
  const sidebarBorder = "rgba(255,255,255,0.06)";
  const planLabel = PLAN_LABELS[accountPlan] || "FREE";
  const upgrade = accountPlan === "free"
    ? { title: t("core_upgrade_pro", lang), copy: t("core_upgrade_pro_copy", lang) }
    : accountPlan === "professional"
      ? { title: t("core_upgrade_business", lang), copy: t("core_upgrade_business_copy", lang) }
      : null;

  const isActive = (href) => {
    if (!href || href === "logout") return false;
    const [hPath, hQuery] = href.split("?");
    if (hQuery) {
      const sp = new URLSearchParams(location.search);
      const hsp = new URLSearchParams(hQuery);
      const viewMatch = hsp.get("view");
      if (viewMatch) {
        if (hPath === "/bingoo" && viewMatch === "home" && location.pathname === "/bingoo" && !sp.get("view")) return true;
        return location.pathname === hPath && sp.get("view") === viewMatch;
      }
      return location.pathname === hPath && location.search === "?" + hQuery;
    }
    if (href === "/bingoo") {
      if (location.pathname !== "/bingoo") return false;
      const sp = new URLSearchParams(location.search);
      const v = sp.get("view");
      return !v || v === "workspace" || v === "hub" || v === "home";
    }
    return location.pathname === href;
  };

  const renderNavLink = (item, onNav, collapsed = false) => {
    const active = isActive(item.href);
    const badge = badgeMap[item.id];
    return (
      <Link
        key={item.id}
        to={item.href}
        onClick={onNav}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center rounded-[11px] text-[13px] font-semibold transition-all duration-150 ${collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"}`}
        style={{
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          border: "1px solid transparent",
          boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
        }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: active ? item.iconBg.replace("0.18", "0.32") : item.iconBg }}>
          <item.icon className="w-[15px] h-[15px]" style={{ color: item.iconColor }} />
        </div>
        {!collapsed && (
          <>
            <span className="group-hover:text-white transition-colors truncate" style={{ color: active ? "#fff" : "rgba(255,255,255,0.68)" }}>
              {item.label}
            </span>
            {item.planBadge && (
              <span className="ml-auto px-1.5 py-0.5 rounded-md text-[8.5px] font-black text-white/70 bg-white/10">{item.planBadge}</span>
            )}
            {badge > 0 && (
              <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: "#F97316" }}>
                {badge > 9 ? "9+" : badge}
              </span>
            )}
            {active && !badge && !item.planBadge && <span className="ml-auto w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#f97316" }} />}
          </>
        )}
      </Link>
    );
  };

  const renderSidebarContent = (onNav, collapsed = false, navRef = null) => (
    <div className="flex flex-col h-full min-h-0">
      <div className={`flex-shrink-0 ${collapsed ? "px-1.5 pt-3" : "px-2.5 pt-3"}`}>
        <div className={`rounded-xl border border-white/[0.08] flex items-center ${collapsed ? "justify-center p-1.5" : "px-2.5 py-2 gap-2.5"}`} style={{ background: "rgba(255,255,255,0.05)" }}>
          {selectedProfile?.profile_photo ? (
            <img src={selectedProfile.profile_photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-black text-orange-400" style={{ background: "rgba(249,115,22,0.12)" }}>
              {(selectedProfile?.display_name || user?.full_name || "B").charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate">{selectedProfile?.display_name || user?.full_name || t("core_my_profile", lang)}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-white/45">{t("core_active_profile", lang)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav ref={navRef} className={`flex-1 overflow-y-auto scroll-smooth ${collapsed ? "px-1.5 py-3" : "px-2.5 py-3"}`}>
        {(onNav ? mobileMenuSections : navSections).map(section => (
          <div key={section.id} className="mb-1.5">
            {!collapsed && <p className="px-2 pt-1.5 pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/30">{section.label}</p>}
            {collapsed && section.id !== "home" && <div className="mx-2 my-2 h-px bg-white/7" />}
            <div className="space-y-px">{section.items.map(item => renderNavLink(item, onNav, collapsed))}</div>
          </div>
        ))}

        {isAdmin && (
          <Link to="/admin" onClick={onNav} title={collapsed ? "Admin Panel" : undefined}
            aria-current={location.pathname === "/admin" ? "page" : undefined}
            className={`group flex items-center rounded-[11px] text-[13px] font-semibold transition-all ${collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"}`}
            style={{
              background: location.pathname === "/admin" ? "rgba(255,255,255,0.10)" : "transparent",
              border: "1px solid transparent",
            }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: location.pathname === "/admin" ? "rgba(239,68,68,0.32)" : "rgba(239,68,68,0.18)" }}>
              <Shield className="w-[15px] h-[15px] text-red-400" />
            </div>
            {!collapsed && <span className="group-hover:text-white transition-colors" style={{ color: location.pathname === "/admin" ? "#fff" : "rgba(255,255,255,0.68)" }}>{t("admin_panel", lang)}</span>}
          </Link>
        )}
      </nav>

      <div className={`${collapsed ? "px-1.5" : "px-2.5"} py-2.5 flex-shrink-0`} style={{ borderTop: `1px solid ${sidebarBorder}` }}>
        {!collapsed && upgrade && !isAdmin && (
          <Link to="/pricing" onClick={onNav} className="mb-2 block rounded-xl border border-orange-400/25 px-2.5 py-2 text-white" style={{ background: "linear-gradient(135deg, rgba(249,115,22,.24), rgba(253,186,33,.12))" }}>
            <div className="flex items-center gap-1.5 text-[12.5px] font-bold"><Briefcase className="w-3.5 h-3.5 text-orange-300" /> {upgrade.title}</div>
            <p className="mt-0.5 text-[10.5px] leading-snug text-white/55 line-clamp-2">{upgrade.copy}</p>
          </Link>
        )}
        {!collapsed && (
          <div className="mb-1.5 flex items-center justify-between rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-white/50" style={{ background: "rgba(255,255,255,.04)" }}>
            <span>{t("core_current_plan", lang)}</span><span className="font-black text-white">{planLabel}</span>
          </div>
        )}
        {!onNav && (
          <button onClick={() => setSidebarCollapsed(value => !value)} aria-label={collapsed ? t("core_expand_sidebar", lang) : t("core_collapse_sidebar", lang)}
            className={`flex items-center w-full rounded-lg text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/8 transition-all ${collapsed ? "justify-center p-2" : "gap-1.5 px-2.5 py-1.5"}`}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> {t("core_collapse_sidebar", lang)}</>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>
      <header className="hidden md:block fixed top-0 inset-x-0 h-[72px] z-40 bg-white border-b border-slate-200">
        <div className="h-full px-8 flex items-center justify-between gap-8">
          <Link to="/bingoo?view=hub" className="flex items-center flex-shrink-0" aria-label={lang === "fr" ? "Tableau de bord Bingoo" : "Bingoo dashboard"}><BrandLockup badgeSize={34} /></Link>
          <nav className="hidden xl:flex items-center gap-9 text-sm font-semibold text-slate-500" aria-label="Main navigation">
            <Link to="/#platform" className="hover:text-slate-900 transition-colors">{t("core_platform", lang)}</Link>
            <Link to="/#solutions" className="hover:text-slate-900 transition-colors">{t("core_solutions", lang)}</Link>
            <Link to="/#pricing" className="hover:text-slate-900 transition-colors">{t("core_pricing", lang)}</Link>
            <Link to="/shop" className="hover:text-slate-900 transition-colors">{t("core_shop", lang)}</Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">{t("core_about", lang)}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} aria-label={lang === "fr" ? "Switch to English" : "Passer en français"} title={lang === "fr" ? "English" : "Français"}
              className="h-9 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">{lang === "fr" ? "EN" : "FR"}</button>
            <NotificationCenter userId={effectiveUserId} isDark={false} lang={lang} />
            <AccountDropdown user={user} plan={accountPlan} logout={logout} isDark={false} />
          </div>
        </div>
      </header>

      <aside className={`hidden md:flex flex-col fixed top-[72px] bottom-0 left-0 z-20 transition-[width] duration-200 ${sidebarCollapsed ? "w-16" : "w-[216px]"}`} style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, backdropFilter: "blur(18px) saturate(140%)", WebkitBackdropFilter: "blur(18px) saturate(140%)" }}>
        {renderSidebarContent(null, sidebarCollapsed, desktopNavRef)}
      </aside>

      <header className="md:hidden fixed top-0 inset-x-0 z-[90] flex items-center justify-between px-4" style={{ background: "linear-gradient(135deg, #061a38 0%, #03162f 100%)", borderBottom: "2px solid #f97316", paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}>
        <Link to="/bingoo?view=hub" aria-label={lang === "fr" ? "Tableau de bord Bingoo" : "Bingoo dashboard"} className="flex items-center gap-2 transition-opacity hover:opacity-80"><BingooLogo className="h-7 w-7" animated={false} /><BingooWordmark size="text-base" light stacked={false} /></Link>
        <div className="flex items-center gap-1.5">
          <button onClick={toggle} aria-label="Toggle dark mode" className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl transition-all bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">{isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-200" />}</button>
          <button onClick={toggleLanguage} aria-label={lang === "fr" ? "Switch to English" : "Passer en français"} className="min-h-[44px] min-w-[44px] px-2.5 rounded-2xl transition-all bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] text-white text-xs font-bold flex items-center justify-center">{lang === "fr" ? "EN" : "FR"}</button>
          <NotificationCenter userId={effectiveUserId} isDark lang={lang} />
          <AccountDropdown user={user} plan={accountPlan} logout={logout} isDark />
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] backdrop-blur-sm bg-black/60" onClick={() => setMobileOpen(false)} role="dialog" aria-label="Navigation menu">
          <div className="flex flex-col w-[260px] h-full shadow-2xl" onClick={e => e.stopPropagation()} style={{ background: sidebarBg, paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex justify-end px-4 pt-3 pb-1"><button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="min-h-[44px] min-w-[44px] p-2 rounded-xl hover:bg-white/10 text-white/60 flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            {renderSidebarContent(() => setMobileOpen(false), false)}
          </div>
        </div>
      )}

      <BottomNav lang={lang} onMore={() => setMobileOpen(true)} />

      <main className={`flex-1 md:pt-[72px] min-w-0 min-h-screen flex flex-col transition-[margin] duration-200 ${sidebarCollapsed ? "md:ml-16" : "md:ml-[216px]"}`} style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        <div className="flex-1 min-w-0 min-h-0">{children}</div>
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(68px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}
