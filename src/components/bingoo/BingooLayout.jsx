import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Shield, Menu, X, Sun, Moon, Home, User, Smartphone, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { useNavBadges } from "@/hooks/useNavBadges";
import { getVisibleNavSections } from "@/lib/sidebarConfigV2";
import BottomNav from "@/components/mobile/BottomNav";
import { t, getLang } from "@/lib/i18n";
import BingooLogo from "@/components/bingoo/BingooLogo";
import { BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { isAdminUser } from "@/lib/auth";
import BrandLockup from "@/components/auth/BrandLockup";
import { AccountDropdown } from "@/components/bingoo/WorkspaceSelectors";
import { useProfileWorkspace } from "@/lib/ProfileWorkspaceContext";
import { usePlan } from "@/hooks/usePlan";

/**
 * BingooLayout
 *
 * Sidebar items are derived from the SELECTED PROFILE object.
 * Pass `selectedProfile` from BingooDashboard — the full profile entity.
 * When no profile is selected (hub view), selectedProfile is null → free sidebar.
 * Admin users see all items + Admin Panel regardless of selected profile.
 */
export default function BingooLayout({ children, selectedProfile: selectedProfileProp, accountPlan: accountPlanProp, lang = "en", userId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useBingooTheme();
  // BottomNav consumes NavigationStackProvider to preserve per-tab history stacks.

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

  const { user, logout } = useAuth();
  const { selectedProfile: workspaceProfile } = useProfileWorkspace();
  const { plan: resolvedAccountPlan } = usePlan();
  const selectedProfile = selectedProfileProp !== undefined ? selectedProfileProp : workspaceProfile;
  const accountPlan = accountPlanProp || resolvedAccountPlan || "free";

  // userId prop takes priority (passed from BingooDashboard which already has the user)
  const effectiveUserId = userId || user?.id;

  // Admin Panel is gated strictly on user.role — never on profile plan
  const isAdmin = isAdminUser(user);

  // Sidebar sections derived from selected profile + effective account plan — isAdmin unlocks everything
  const navSections = getVisibleNavSections(selectedProfile, isAdmin, lang, accountPlan || null);

  // Unread notification badges mapped to nav item IDs
  const { badgeMap, totalUnread } = useNavBadges(effectiveUserId, selectedProfile?.id);

  const sidebarBg     = "linear-gradient(180deg, #0b2149 0%, #0a1d3f 60%, #071A3D 100%)";
  const sidebarBorder = "rgba(255,255,255,0.07)";

  const isActive = (href) => {
    if (!href || href === "logout") return false;
    const [hPath, hQuery] = href.split("?");
    if (hQuery) {
      const sp  = new URLSearchParams(location.search);
      const hsp = new URLSearchParams(hQuery);
      const viewMatch = hsp.get("view");
      if (viewMatch) {
      // /bingoo with no view defaults to "home" — match the Dashboard nav item
      if (hPath === "/bingoo" && viewMatch === "home" && location.pathname === "/bingoo" && !sp.get("view")) return true;
      return location.pathname === hPath && sp.get("view") === viewMatch;
    }
      return location.pathname === hPath && location.search === "?" + hQuery;
    }
    if (href === "/bingoo") {
      if (location.pathname !== "/bingoo") return false;
      const sp = new URLSearchParams(location.search);
      const v  = sp.get("view");
      return !v || v === "workspace" || v === "hub" || v === "home";
    }
    return location.pathname === href && !location.search;
  };

  // Render helpers (plain functions, not React components, so no remount risk)
  const renderNavLink = (item, onNav) => {
    const active = isActive(item.href);
    const badge = badgeMap[item.id];
    return (
      <Link key={item.id} to={item.href} onClick={onNav}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: active ? item.iconBg.replace("0.18", "0.32") : item.iconBg }}>
          <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
        </div>
        <span className="group-hover:text-white transition-colors"
          style={{ color: active ? "#fff" : "rgba(255,255,255,0.60)" }}>
          {item.label}
        </span>
        {badge > 0 && (
          <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: "#F97316" }}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
        {active && !badge && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.iconColor }} />}
      </Link>
    );
  };

  // Sidebar header — notification bell removed; bell now lives in the dashboard top bar
  const renderSidebarContent = (onNav) => (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 pt-4">
        <div className="rounded-2xl border border-white/10 px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.07)" }}>
          {selectedProfile?.profile_photo ? (
            <img src={selectedProfile.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/10" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-orange-400"
              style={{ background: "rgba(249,115,22,0.12)" }}>
              {(selectedProfile?.display_name || user?.full_name || "B").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">
              {selectedProfile?.display_name || user?.full_name || "My Profile"}
            </p>
            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize text-white/50 bg-white/8">
              {accountPlan || "free"}
            </span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.id} className="mb-2">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => renderNavLink(item, onNav))}
            </div>
          </div>
        ))}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: location.pathname === "/admin" ? "rgba(255,255,255,0.10)" : "transparent",
              border: location.pathname === "/admin" ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: location.pathname === "/admin" ? "rgba(239,68,68,0.32)" : "rgba(239,68,68,0.18)" }}>
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <span className="group-hover:text-white transition-colors"
              style={{ color: location.pathname === "/admin" ? "#fff" : "rgba(255,255,255,0.60)" }}>
              {t("admin_panel", lang)}
            </span>
            {location.pathname === "/admin" && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-400" />
            )}
          </Link>
        )}
      </nav>
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
        {(!accountPlan || accountPlan === "free") && !isAdmin && (
          <Link to="/pricing" onClick={onNav}
            className="mb-3 block rounded-xl border border-orange-400/30 p-3 text-white"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,.24), rgba(253,186,33,.12))" }}>
            <div className="flex items-center gap-2 text-sm font-black">
              <Briefcase className="w-4 h-4 text-orange-300" /> Upgrade to Pro
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">
              Unlock media, portfolio, analytics, appointments, and premium layouts.
            </p>
          </Link>
        )}
        <button onClick={toggle} aria-label="Toggle dark mode"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all text-white border border-white/10"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          {isDark
            ? <><Sun className="w-4 h-4 text-yellow-400" /> {t("light_mode", lang)}</>
            : <><Moon className="w-4 h-4 text-blue-300" /> {t("dark_mode", lang)}</>}
        </button>
        <a href="/account-settings#delete" aria-label="Delete account" className="text-xs text-red-400/60 hover:text-red-400 transition-colors min-h-[44px] flex items-center px-3">
          Delete Account
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>

      {/* One persistent account header for every signed-in workspace page. */}
      <header className="hidden md:block fixed top-0 inset-x-0 h-[72px] z-40 bg-white border-b border-slate-200">
        <div className="h-full px-8 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Bingoo Connect home">
            <BrandLockup badgeSize={34} />
          </Link>
          <nav className="hidden xl:flex items-center gap-9 text-sm font-semibold text-slate-500" aria-label="Main navigation">
            <Link to="/shop" className="hover:text-slate-900 transition-colors">Products</Link>
            <Link to="/" className="hover:text-slate-900 transition-colors">Templates</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/plans" className="hover:text-slate-900 transition-colors">For Business</Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">About</Link>
          </nav>
          <AccountDropdown user={user} plan={accountPlan || "free"} logout={logout} isDark={false} />
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 fixed top-[72px] bottom-0 left-0 z-20"
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>
        {renderSidebarContent(null)}
      </aside>

      {/* ── MOBILE TOP HEADER ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4"
        style={{
        background: "linear-gradient(135deg, #0b2149 0%, #13284f 100%)",
        borderBottom: "2px solid #f97316",
          paddingTop: "env(safe-area-inset-top)",
          height: "calc(56px + env(safe-area-inset-top))",
        }}>
        <Link to="/" aria-label="Bingoo Connect home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <BingooLogo className="h-7 w-7" animated={false} />
          <BingooWordmark size="text-base" light stacked={false} />
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={toggle} aria-label="Toggle dark mode"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors bg-white/10 hover:bg-white/18 text-white flex items-center justify-center">
            {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-200" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors hover:bg-white/10 text-white flex items-center justify-center">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OUT DRAWER (same navItems, plan-gated) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/60"
          onClick={() => setMobileOpen(false)} role="dialog" aria-label="Navigation menu">
          <div className="flex flex-col w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()}
            style={{
              background: sidebarBg,
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}>
            <div className="flex justify-end px-4 pt-3 pb-1">
              <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl hover:bg-white/10 text-white/60 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent(() => setMobileOpen(false))}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <BottomNav lang={lang} totalUnread={totalUnread} onMore={() => setMobileOpen(true)} />

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-64 md:pt-[72px] min-w-0 min-h-screen flex flex-col"
        style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        <div className="flex-1 min-w-0 min-h-0">
          {children}
        </div>
        {/* Bottom spacer: ensures content isn't hidden behind fixed bottom nav */}
        <div className="md:hidden flex-shrink-0" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}
