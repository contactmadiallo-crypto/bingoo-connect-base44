import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Shield, Menu, X, Sun, Moon, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useProfileWorkspace } from "@/lib/ProfileWorkspaceContext";
import { usePlan } from "@/hooks/usePlan";

const PLAN_LABELS = {
  free: "FREE",
  professional: "PRO",
  business: "BUSINESS",
  salon: "SALON",
  restaurant: "RESTAURANT",
  lawfirm: "LAW FIRM",
  corporate: "CORPORATE",
};

export default function BingooLayout({ children, selectedProfile: selectedProfileProp, accountPlan: accountPlanProp, lang = "en", userId }) {
  const location = useLocation();
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
  const navSections = getVisibleNavSections(selectedProfile, isAdmin, lang, accountPlan);
  const { badgeMap, totalUnread } = useNavBadges(effectiveUserId, selectedProfile?.id);

  const sidebarBg = "linear-gradient(180deg, #0b2149 0%, #0a1d3f 60%, #071A3D 100%)";
  const sidebarBorder = "rgba(255,255,255,0.07)";
  const planLabel = PLAN_LABELS[accountPlan] || "FREE";
  const upgrade = accountPlan === "free"
    ? { title: "Upgrade to Pro", copy: "Unlock My Assets, NFC Devices, Lost & Found, analytics and more." }
    : accountPlan === "professional"
      ? { title: "Upgrade to Business", copy: "Unlock Engage, Design Studio, services, team tools and more." }
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
    return location.pathname === href && !location.search;
  };

  const renderNavLink = (item, onNav, collapsed = false) => {
    const active = isActive(item.href);
    const badge = badgeMap[item.id];
    return (
      <Link key={item.id} to={item.href} onClick={onNav} title={collapsed ? item.label : undefined}
        className={`group flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
        style={{
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: active ? item.iconBg.replace("0.18", "0.32") : item.iconBg }}>
          <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
        </div>
        {!collapsed && (
          <>
            <span className="group-hover:text-white transition-colors truncate" style={{ color: active ? "#fff" : "rgba(255,255,255,0.68)" }}>
              {item.label}
            </span>
            {item.planBadge && (
              <span className="ml-auto px-2 py-0.5 rounded-md text-[9px] font-black text-white/75 bg-white/10">{item.planBadge}</span>
            )}
            {badge > 0 && (
              <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: "#F97316" }}>
                {badge > 9 ? "9+" : badge}
              </span>
            )}
            {active && !badge && !item.planBadge && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.iconColor }} />}
          </>
        )}
      </Link>
    );
  };

  const renderSidebarContent = (onNav, collapsed = false) => (
    <div className="flex flex-col h-full min-h-0">
      <div className={`flex-shrink-0 ${collapsed ? "px-2 pt-4" : "px-3 pt-4"}`}>
        <div className={`rounded-2xl border border-white/10 flex items-center ${collapsed ? "justify-center p-2" : "px-4 py-4 gap-3"}`} style={{ background: "rgba(255,255,255,0.07)" }}>
          {selectedProfile?.profile_photo ? (
            <img src={selectedProfile.profile_photo} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-white/10" />
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-orange-400" style={{ background: "rgba(249,115,22,0.12)" }}>
              {(selectedProfile?.display_name || user?.full_name || "B").charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate">{selectedProfile?.display_name || user?.full_name || "My Profile"}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold text-white/50">Active Profile</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2 py-4" : "px-3 py-4"}`}>
        {navSections.map(section => (
          <div key={section.id} className={collapsed ? "mb-2" : "mb-2"}>
            {!collapsed && <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{section.label}</p>}
            {collapsed && section.id !== "home" && <div className="mx-2 my-2 h-px bg-white/7" />}
            <div className="space-y-0.5">{section.items.map(item => renderNavLink(item, onNav, collapsed))}</div>
          </div>
        ))}

        {isAdmin && (
          <Link to="/admin" onClick={onNav} title={collapsed ? "Admin Panel" : undefined}
            className={`group flex items-center rounded-xl text-sm font-semibold transition-all ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
            style={{
              background: location.pathname === "/admin" ? "rgba(255,255,255,0.10)" : "transparent",
              border: location.pathname === "/admin" ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: location.pathname === "/admin" ? "rgba(239,68,68,0.32)" : "rgba(239,68,68,0.18)" }}>
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            {!collapsed && <span className="group-hover:text-white transition-colors" style={{ color: location.pathname === "/admin" ? "#fff" : "rgba(255,255,255,0.68)" }}>{t("admin_panel", lang)}</span>}
          </Link>
        )}
      </nav>

      <div className={`${collapsed ? "px-2" : "px-3"} py-3 flex-shrink-0`} style={{ borderTop: `1px solid ${sidebarBorder}` }}>
        {!collapsed && upgrade && !isAdmin && (
          <Link to="/pricing" onClick={onNav} className="mb-3 block rounded-xl border border-orange-400/30 p-3 text-white" style={{ background: "linear-gradient(135deg, rgba(249,115,22,.24), rgba(253,186,33,.12))" }}>
            <div className="flex items-center gap-2 text-sm font-black"><Briefcase className="w-4 h-4 text-orange-300" /> {upgrade.title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">{upgrade.copy}</p>
          </Link>
        )}
        {!collapsed && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55" style={{ background: "rgba(255,255,255,.05)" }}>
            <span>Current plan</span><span className="font-black text-white">{planLabel}</span>
          </div>
        )}
        <button onClick={toggle} aria-label="Toggle dark mode" title={collapsed ? (isDark ? "Light mode" : "Dark mode") : undefined}
          className={`flex items-center w-full rounded-xl text-sm font-semibold mb-2 transition-all text-white border border-white/10 ${collapsed ? "justify-center p-2.5" : "gap-3 px-4 py-2.5"}`} style={{ background: "rgba(255,255,255,0.08)" }}>
          {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
          {!collapsed && (isDark ? t("light_mode", lang) : t("dark_mode", lang))}
        </button>
        {!collapsed && <a href="/account-settings#delete" aria-label="Delete account" className="text-xs text-red-400/60 hover:text-red-400 transition-colors min-h-[36px] flex items-center px-3">Delete Account</a>}
        {!onNav && (
          <button onClick={() => setSidebarCollapsed(value => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-1 flex items-center w-full rounded-xl text-xs font-semibold text-white/55 hover:text-white hover:bg-white/8 transition-all ${collapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2.5"}`}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse Sidebar</>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>
      <header className="hidden md:block fixed top-0 inset-x-0 h-[72px] z-40 bg-white border-b border-slate-200">
        <div className="h-full px-8 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Bingoo Connect home"><BrandLockup badgeSize={34} /></Link>
          <nav className="hidden xl:flex items-center gap-9 text-sm font-semibold text-slate-500" aria-label="Main navigation">
            <Link to="/shop" className="hover:text-slate-900 transition-colors">Products</Link>
            <Link to="/" className="hover:text-slate-900 transition-colors">Templates</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/plans" className="hover:text-slate-900 transition-colors">For Business</Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">About</Link>
          </nav>
          <AccountDropdown user={user} plan={accountPlan} logout={logout} isDark={false} />
        </div>
      </header>

      <aside className={`hidden md:flex flex-col fixed top-[72px] bottom-0 left-0 z-20 transition-[width] duration-200 ${sidebarCollapsed ? "w-[76px]" : "w-64"}`} style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>
        {renderSidebarContent(null, sidebarCollapsed)}
      </aside>

      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4" style={{ background: "linear-gradient(135deg, #0b2149 0%, #13284f 100%)", borderBottom: "2px solid #f97316", paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}>
        <Link to="/" aria-label="Bingoo Connect home" className="flex items-center gap-2 transition-opacity hover:opacity-80"><BingooLogo className="h-7 w-7" animated={false} /><BingooWordmark size="text-base" light stacked={false} /></Link>
        <div className="flex items-center gap-1">
          <button onClick={toggle} aria-label="Toggle dark mode" className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors bg-white/10 hover:bg-white/18 text-white flex items-center justify-center">{isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-200" />}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu" className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors hover:bg-white/10 text-white flex items-center justify-center">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/60" onClick={() => setMobileOpen(false)} role="dialog" aria-label="Navigation menu">
          <div className="flex flex-col w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()} style={{ background: sidebarBg, paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex justify-end px-4 pt-3 pb-1"><button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="min-h-[44px] min-w-[44px] p-2 rounded-xl hover:bg-white/10 text-white/60 flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            {renderSidebarContent(() => setMobileOpen(false), false)}
          </div>
        </div>
      )}

      <BottomNav lang={lang} totalUnread={totalUnread} onMore={() => setMobileOpen(true)} />

      <main className={`flex-1 md:pt-[72px] min-w-0 min-h-screen flex flex-col transition-[margin] duration-200 ${sidebarCollapsed ? "md:ml-[76px]" : "md:ml-64"}`} style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        <div className="flex-1 min-w-0 min-h-0">{children}</div>
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}
