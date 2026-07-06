import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Shield, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { useNavBadges } from "@/hooks/useNavBadges";
import { getVisibleNavItems } from "@/lib/sidebarConfig";
import { useNavigationStack } from "@/components/mobile/NavigationStack";
import { t, getLang } from "@/lib/i18n";
import BingooLogo from "@/components/bingoo/BingooLogo";

/**
 * BingooLayout
 *
 * Sidebar items are derived from the SELECTED PROFILE object.
 * Pass `selectedProfile` from BingooDashboard — the full profile entity.
 * When no profile is selected (hub view), selectedProfile is null → free sidebar.
 * Admin users see all items + Admin Panel regardless of selected profile.
 */
export default function BingooLayout({ children, selectedProfile, accountPlan, lang = "en", userId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useBingooTheme();
  const { switchTab, resetStack } = useNavigationStack();

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

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  // userId prop takes priority (passed from BingooDashboard which already has the user)
  const effectiveUserId = userId || user?.id;

  // Admin Panel is gated strictly on user.role — never on profile plan
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // All sidebar items derived from selected profile + effective account plan — isAdmin unlocks everything
  const navItems = getVisibleNavItems(selectedProfile, isAdmin, lang, accountPlan || null);

  // Unread notification badges mapped to nav item IDs
  const { badgeMap, totalUnread } = useNavBadges(effectiveUserId, selectedProfile?.id);

  const sidebarBg     = "linear-gradient(180deg, #0B2E6B 0%, #0a2558 60%, #071b47 100%)";
  const sidebarBorder = "rgba(255,255,255,0.07)";

  const isActive = (href) => {
    if (!href || href === "logout") return false;
    const [hPath, hQuery] = href.split("?");
    if (hQuery) {
      const sp  = new URLSearchParams(location.search);
      const hsp = new URLSearchParams(hQuery);
      const viewMatch = hsp.get("view");
      if (viewMatch) return location.pathname === hPath && sp.get("view") === viewMatch;
      return location.pathname === hPath && location.search === "?" + hQuery;
    }
    if (href === "/bingoo") {
      if (location.pathname !== "/bingoo") return false;
      const sp = new URLSearchParams(location.search);
      const v  = sp.get("view");
      return !v || v === "workspace" || v === "hub";
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
      <div className="flex-shrink-0">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)" }} />
        <Link to="/" className="px-5 py-5 flex items-center gap-3 transition-opacity hover:opacity-80" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
          <BingooLogo className="h-12 w-12 flex-shrink-0" animated />
          <div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold leading-tight">
              CONNECT • SHARE • GROW
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => renderNavLink(item, onNav))}
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
        <button onClick={toggle} aria-label="Toggle dark mode"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all text-white border border-white/10"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          {isDark
            ? <><Sun className="w-4 h-4 text-yellow-400" /> {t("light_mode", lang)}</>
            : <><Moon className="w-4 h-4 text-blue-300" /> {t("dark_mode", lang)}</>}
        </button>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">{user?.full_name}</p>
            <p className="text-xs truncate text-white/40">{user?.email}</p>
          </div>
          <button
            onClick={() => { base44.auth.logout(); window.location.href = "/login"; }}
            title="Logout" aria-label="Logout"
            className="p-2 rounded-lg transition-colors hover:bg-white/10">
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </div>
        <a href="/account-settings#delete" aria-label="Delete account" className="text-xs text-red-400/60 hover:text-red-400 transition-colors min-h-[44px] flex items-center px-3">
          Delete Account
        </a>
      </div>
    </div>
  );

  // Mobile bottom bar 4th slot: prefer analytics for Pro individual; appointments for business verticals
  // Order precedence: analytics > appointments > leads (analytics is always the dashboard primary)
  const fourthBottomItem =
    navItems.find(i => i.id === "analytics") ||
    navItems.find(i => i.id === "appointments") ||
    navItems.find(i => i.id === "connections") ||
    null;

  // Order: Landing → Profiles → 4th slot → Logout (More is a fixed button between Landing and Profiles)
  const bottomNavItems = [
    navItems.find(i => i.id === "landing"),
    navItems.find(i => i.id === "profiles"),
    fourthBottomItem,
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? "#0f1117" : "#f8fafc" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-20"
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>
        {renderSidebarContent(null)}
      </aside>

      {/* ── MOBILE TOP HEADER ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4"
        style={{
          background: "linear-gradient(135deg, #0B2E6B 0%, #1a4a9e 100%)",
          borderBottom: "2px solid #FF7A00",
          paddingTop: "env(safe-area-inset-top)",
          height: "calc(56px + env(safe-area-inset-top))",
        }}>
        <Link to="/" aria-label="Bingoo Connect home" className="transition-opacity hover:opacity-80">
          <BingooLogo className="h-8 w-8" animated={false} />
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
      {/* Order: Landing | More | Profiles | Appointments/Analytics | Logout */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center"
        style={{
          background: "linear-gradient(180deg, #0a2558 0%, #071b47 100%)",
          borderTop: "1px solid rgba(255,122,0,0.4)",
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(60px + env(safe-area-inset-bottom))",
        }}>

        {/* 1. Landing Page */}
        {(() => {
          const item = navItems.find(i => i.id === "landing");
          if (!item) return null;
          const active = isActive(item.href);
          return (
            <Link to={item.href}
              onClick={(e) => { e.preventDefault(); const tid = item.href.split('?')[0].split('/')[1] || 'home'; if (active) { resetStack(tid, item.href); } else { switchTab(tid, item.href); } }}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity" style={{ touchAction: 'manipulation' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: active ? "rgba(255,122,0,0.25)" : "rgba(255,255,255,0.08)" }}>
                <item.icon className="w-5 h-5" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }}>
                {item.label}
              </span>
            </Link>
          );
        })()}

        {/* 2. More — opens full sidebar drawer */}
        <button onClick={() => setMobileOpen(true)} aria-label="More navigation options"
          className="relative flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity" style={{ touchAction: 'manipulation' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
            <Menu className="w-5 h-5 text-white/40" />
          </div>
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-24px)] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: "#F97316" }}>
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
          <span className="text-xs font-semibold text-white/40">{t("more", lang)}</span>
        </button>

        {/* 3. Profiles */}
        {(() => {
          const item = navItems.find(i => i.id === "profiles");
          if (!item) return null;
          const active = isActive(item.href);
          return (
            <Link to={item.href}
              onClick={(e) => { e.preventDefault(); const tid = item.href.split('?')[0].split('/')[1] || 'home'; if (active) { resetStack(tid, item.href); } else { switchTab(tid, item.href); } }}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity" style={{ touchAction: 'manipulation' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: active ? "rgba(255,122,0,0.25)" : "rgba(255,255,255,0.08)" }}>
                <item.icon className="w-5 h-5" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }}>
                {item.label}
              </span>
            </Link>
          );
        })()}

        {/* 4. Appointments (if available) or Analytics */}
        {fourthBottomItem && (() => {
          const item = fourthBottomItem;
          const active = isActive(item.href);
          return (
            <Link to={item.href}
              onClick={(e) => { e.preventDefault(); const tid = item.href.split('?')[0].split('/')[1] || 'home'; if (active) { resetStack(tid, item.href); } else { switchTab(tid, item.href); } }}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity" style={{ touchAction: 'manipulation' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: active ? "rgba(255,122,0,0.25)" : "rgba(255,255,255,0.08)" }}>
                <item.icon className="w-5 h-5" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }}>
                {item.label}
              </span>
            </Link>
          );
        })()}

        {/* 5. Logout */}
        <button onClick={() => { base44.auth.logout(); window.location.href = "/login"; }}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity" style={{ touchAction: 'manipulation' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-xs font-semibold text-red-400">{t("logout", lang)}</span>
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-64 overflow-x-hidden overflow-y-auto"
        style={{ background: isDark ? "#0f1117" : "#f8fafc", minHeight: "100vh" }}>
        <div className="md:hidden" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        {children}
        <div className="md:hidden" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}