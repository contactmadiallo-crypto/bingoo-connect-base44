import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, User, Smartphone, BarChart3, CreditCard, LogOut, Star, Shield, Menu, X, CalendarDays, Briefcase, Sun, Moon, Home } from "lucide-react";
import { useState } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const navItems = [
  { label: "Home",         icon: Home,            href: "/",                        color: "from-slate-500 to-slate-600" },
  { label: "Dashboard",    icon: LayoutDashboard, href: "/bingoo",                  color: "from-blue-500 to-blue-600" },
  { label: "My Profile",   icon: User,            href: "/bingoo?tab=profile",      color: "from-violet-500 to-violet-600" },
  { label: "Appointments", icon: CalendarDays,    href: "/bingoo?tab=appointments", color: "from-emerald-500 to-emerald-600" },
  { label: "Leads",        icon: Star,            href: "/bingoo?tab=leads",        color: "from-amber-500 to-amber-600" },
  { label: "My NFC Devices", icon: Smartphone,    href: "/my-nfc-devices",          color: "from-cyan-500 to-cyan-600" },
  { label: "Analytics",    icon: BarChart3,       href: "/bingoo?tab=analytics",    color: "from-pink-500 to-pink-600" },
  { label: "Portfolio",    icon: Briefcase,       href: "/bingoo?tab=portfolio",    color: "from-violet-500 to-violet-600" },
  { label: "Billing",      icon: CreditCard,      href: "/billing",                 color: "from-orange-500 to-orange-600" },
];

// Bottom tab bar items (most used)
const bottomTabs = [
  { label: "Home",     icon: Home,          href: "/bingoo",             color: "#3b82f6" },
  { label: "Profile",  icon: User,          href: "/bingoo?tab=profile", color: "#8b5cf6" },
  { label: "NFC",      icon: Smartphone,    href: "/my-nfc-devices",     color: "#06b6d4" },
  { label: "More",     icon: Menu,          href: null,                  color: "#64748b" },
  { label: "Logout",   icon: LogOut,        href: "logout",              color: "#ef4444" },
];

export default function BingooLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useBingooTheme();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const isActive = (href) => {
    if (!href || href === "logout") return false;
    if (href.includes("?")) {
      return location.pathname === "/bingoo" && location.search === "?" + href.split("?")[1];
    }
    return location.pathname === href && !location.search;
  };

  // Sidebar is always Bingoo navy regardless of dark/light mode
  const t = {
    bg: isDark ? "#0f1117" : "#f8fafc",
    sidebar: "linear-gradient(180deg, #0B2E6B 0%, #0a2558 60%, #071b47 100%)",
    sidebarBorder: "rgba(255,255,255,0.07)",
    headerBg: isDark ? "#0B2E6B" : "#0B2E6B",
    headerBorder: "rgba(255,255,255,0.1)",
    text: "text-white",
    textMuted: "text-white/40",
    activeLink: "rgba(255,122,0,0.18)",
    activeBorder: "#FF7A00",
    inactiveLink: "text-white/50 hover:text-white hover:bg-white/8",
    userBg: "bg-white/8",
    logoutHover: "hover:bg-white/10",
    mobileDrawer: "bg-black/60",
    drawerBg: "linear-gradient(180deg, #0B2E6B 0%, #0a2558 60%, #071b47 100%)",
  };

  const NavLink = ({ item, onNav }) => {
    const active = isActive(item.href);
    return (
      <Link to={item.href} onClick={onNav}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? "text-white" : t.inactiveLink}`}
        style={active ? { background: t.activeLink, borderLeft: `3px solid ${t.activeBorder}` } : {}}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all`}
          style={active ? { background: "#FF7A00", boxShadow: "0 4px 12px rgba(255,122,0,0.35)" } : { background: "rgba(255,255,255,0.08)" }}>
          <item.icon className={`w-4 h-4 ${active ? "text-white" : "text-white/50"}`} />
        </div>
        {item.label}
        {active && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "#FF7A00" }} />}
      </Link>
    );
  };

  const SidebarContent = ({ onNav }) => (
    <div className="flex flex-col h-full">
      {/* Logo + orange accent */}
      <div className="flex-shrink-0">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)" }} />
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png"
            alt="Bingoo Connect" className="h-10 w-auto object-contain" />
          <div className="text-[10px] uppercase tracking-widest mt-2 font-bold text-white/30">CONNECT • SHARE • GROW</div>
        </div>
      </div>

      {/* Nav links - scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.label} item={item} onNav={onNav} />)}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === "/admin"
                ? "text-white"
                : "text-white/50 hover:text-white hover:bg-white/8"
            }`}
            style={location.pathname === "/admin" ? { background: "rgba(255,122,0,0.18)", borderLeft: "3px solid #FF7A00" } : {}}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={location.pathname === "/admin" ? { background: "#FF7A00", boxShadow: "0 4px 12px rgba(255,122,0,0.35)" } : { background: "rgba(255,255,255,0.08)" }}>
              <Shield className={`w-4 h-4 ${location.pathname === "/admin" ? "text-white" : "text-white/50"}`} />
            </div>
            Admin Panel
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
          <button onClick={() => base44.auth.logout()} title="Logout"
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
        <div className={`md:hidden fixed inset-0 z-40 backdrop-blur-sm ${t.mobileDrawer}`}
          onClick={() => setMobileOpen(false)}>
          <div className="flex flex-col w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ background: t.drawerBg, paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
            {/* Close button at top */}
            <div className="flex justify-end px-4 pt-3 pb-1">
              <button onClick={() => setMobileOpen(false)}
                className={`p-2 rounded-xl ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-400"}`}>
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
        {bottomTabs.map((item) => {
          if (item.href === "logout") {
            return (
              <button key="logout" onClick={() => base44.auth.logout()}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: item.color }}>Logout</span>
              </button>
            );
          }
          if (item.href === null) {
            return (
              <button key="more" onClick={() => setMobileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/8">
                  <item.icon className="w-5 h-5 text-white/40" />
                </div>
                <span className="text-[10px] font-semibold text-white/40">More</span>
              </button>
            );
          }
          const active = isActive(item.href);
          return (
            <Link key={item.label} to={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: active ? "rgba(255,122,0,0.25)" : "rgba(255,255,255,0.08)" }}>
                <item.icon className="w-5 h-5 transition-all" style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }} />
              </div>
              <span className="text-[10px] font-semibold transition-all"
                style={{ color: active ? "#FF7A00" : "rgba(255,255,255,0.4)" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ── */}
      {/* Mobile: push content below top header and above bottom tab bar */}
      {/* Desktop: only offset by sidebar (ml-64), no top/bottom padding needed */}
      <main className="flex-1 md:ml-64 overflow-x-hidden overflow-y-auto"
        style={{ background: t.bg, minHeight: "100vh" }}
      >
        {/* Mobile: push content below top header and above bottom tab bar */}
        <div className="md:hidden" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        {children}
        <div className="md:hidden" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}