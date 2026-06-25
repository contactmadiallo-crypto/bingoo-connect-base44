import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Shield, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import NotificationCenter from "@/components/bingoo/NotificationCenter";
import { getVisibleNavItems } from "@/lib/sidebarConfig";
import { normalizePlan } from "@/lib/planPermissions";

/**
 * BingooLayout
 *
 * Sidebar items are derived from the SELECTED PROFILE's plan.
 * Pass `selectedProfilePlan` (string) from BingooDashboard so the
 * sidebar updates whenever a different profile is selected.
 *
 * If no profile is selected (e.g. on the hub), fall back to the
 * user's highest plan so the sidebar isn't empty.
 */
export default function BingooLayout({ children, selectedProfilePlan }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useBingooTheme();

  // Prevent search engines from indexing authenticated dashboard pages
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
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Resolve the plan to drive sidebar visibility
  const resolvedPlan = normalizePlan(selectedProfilePlan || "free");

  // Build sidebar items from selected profile's plan
  const navItems = getVisibleNavItems(resolvedPlan, isAdmin);

  // Bottom tab bar — always the same 5 core tabs (More opens the drawer for extras)
  const bottomTabs = [
    { label: "Profiles",  href: "/bingoo",                  id: "profiles" },
    { label: "Analytics", href: "/bingoo?view=analytics",   id: "analytics" },
    { label: "Devices",   href: "/my-nfc-devices",          id: "devices" },
    { label: "More",      href: null,                       id: "more" },
    { label: "Logout",    href: "logout",                   id: "logout" },
  ];

  const isActive = (href) => {
    if (!href || href === "logout") return false;
    const [hPath, hQuery] = href.split("?");
    if (hQuery) {
      const sp = new URLSearchParams(location.search);
      const hsp = new URLSearchParams(hQuery);
      const viewMatch = hsp.get("view");
      if (viewMatch) return location.pathname === hPath && sp.get("view") === viewMatch;
      return location.pathname === hPath && location.search === "?" + hQuery;
    }
    if (href === "/bingoo") {
      if (location.pathname !== "/bingoo") return false;
      const sp = new URLSearchParams(location.search);
      const v = sp.get("view");
      return !v || v === "workspace" || v === "hub";
    }
    return location.pathname === href && !location.search;
  };

  const t = {
    bg: isDark ? "#0f1117" : "#f8fafc",
    sidebar: "linear-gradient(180deg, #0B2E6B 0%, #0a2558 60%, #071b47 100%)",
    sidebarBorder: "rgba(255,255,255,0.07)",
  };

  const NavLink = ({ item, onNav }) => {
    const active = isActive(item.href);
    return (
      <Link to={item.href} onClick={onNav}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: active ? item.iconBg.replace("0.18", "0.32") : item.iconBg }}>
          <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
        </div>
        <span style={{ color: active ? "#fff" : "rgba(255,255,255,0.60)" }}
          className="group-hover:text-white transition-colors">{item.label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.iconColor }} />}
      </Link>
    );
  };

  const SidebarContent = ({ onNav }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex-shrink-0">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)" }} />
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png"
            alt="Bingoo Connect" className="h-10 w-auto object-contain" />
          <div className="text-[10px] uppercase tracking-widest mt-2 font-bold text-white/30">CONNECT • SHARE • GROW</div>
        </div>
      </div>

      {/* Nav links — scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.id} item={item} onNav={onNav} />)}

        {/* Admin Panel link — only for admins */}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: location.pathname === "/admin" ? "rgba(255,255,255,0.10)" : "transparent",
              border: location.pathname === "/admin" ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: location.pathname === "/admin" ? "rgba(239,68,68,0.32)" : "rgba(239,68,68,0.18)" }}>
              <Shield className="w-4 h-4" style={{ color: "#ef4444" }} />
            </div>
            <span style={{ color: location.pathname === "/admin" ? "#fff" : "rgba(255,255,255,0.60)" }}
              className="group-hover:text-white transition-colors">Admin Panel</span>
            {location.pathname === "/admin" && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-400" />}
          </Link>
        )}
      </nav>

      {/* User + actions */}
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
        <button onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all bg-white/8 text-white hover:bg-white/14 border border-white/10">
          {isDark ? <><Sun className="w-4 h-4 text-yellow-400" /> Light Mode</> : <><Moon className="w-4 h-4 text-blue-300" /> Dark Mode</>}
        </button>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">{user?.full_name}</p>
            <p className="text-xs truncate text-white/40">{user?.email}</p>
          </div>
          <button onClick={() => { base44.auth.logout(); window.location.href = "/login"; }} title="Logout"
            className="p-2 rounded-lg transition-colors hover:bg-white/10">
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: t.bg }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-20"
        style={{ background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}` }}>
        <SidebarContent onNav={null} />
      </aside>

      {/* ── MOBILE TOP HEADER ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4"
        style={{
          background: "linear-gradient(135deg, #0B2E6B 0%, #1a4a9e 100%)",
          borderBottom: "2px solid #FF7A00",
          paddingTop: "env(safe-area-inset-top)",
          height: "calc(56px + env(safe-area-inset-top))",
        }}>
        <img
          src="https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png"
          alt="Bingoo Connect" className="h-8 w-auto object-contain" />
        <div className="flex items-center gap-1">
          <NotificationCenter userId={user?.id} isDark={true} />
          <button onClick={toggle}
            className="p-2.5 rounded-xl transition-colors bg-white/10 hover:bg-white/18 text-white">
            {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-200" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl transition-colors hover:bg-white/10 text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OUT DRAWER ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/60"
          onClick={() => setMobileOpen(false)}>
          <div className="flex flex-col w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()}
            style={{
              background: t.sidebar,
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}>
            <div className="flex justify-end px-4 pt-3 pb-1">
              <button onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center"
        style={{
          background: "linear-gradient(180deg, #0a2558 0%, #071b47 100%)",
          borderTop: "1px solid rgba(255,122,0,0.4)",
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(60px + env(safe-area-inset-bottom))",
        }}>
        {bottomTabs.map((tab) => {
          if (tab.id === "logout") {
            return (
              <button key="logout" onClick={() => { base44.auth.logout(); window.location.href = "/login"; }}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-[10px] font-semibold text-red-400">Logout</span>
              </button>
            );
          }
          if (tab.id === "more") {
            return (
              <button key="more" onClick={() => setMobileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
                <Menu className="w-5 h-5 text-white/40" />
                <span className="text-[10px] font-semibold text-white/40">More</span>
              </button>
            );
          }
          // Find matching nav item for icon + color
          const navItem = navItems.find(n => n.id === tab.id);
          if (!navItem && tab.id !== "profiles") return null; // hide if plan doesn't include it
          const active = isActive(tab.href);
          const iconColor = active ? "#FF7A00" : "rgba(255,255,255,0.4)";
          return (
            <Link key={tab.id} to={tab.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: active ? "rgba(255,122,0,0.25)" : "rgba(255,255,255,0.08)" }}>
                {navItem
                  ? <navItem.icon className="w-5 h-5 transition-all" style={{ color: iconColor }} />
                  : null
                }
              </div>
              <span className="text-[10px] font-semibold transition-all" style={{ color: iconColor }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-64 overflow-x-hidden overflow-y-auto"
        style={{ background: t.bg, minHeight: "100vh" }}>
        <div className="md:hidden" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        {children}
        <div className="md:hidden" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}