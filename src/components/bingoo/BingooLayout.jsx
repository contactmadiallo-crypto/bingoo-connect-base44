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
  { label: "My Devices",   icon: Smartphone,      href: "/bingoo?tab=devices",      color: "from-cyan-500 to-cyan-600" },
  { label: "Analytics",    icon: BarChart3,       href: "/bingoo?tab=analytics",    color: "from-pink-500 to-pink-600" },
  { label: "Portfolio",    icon: Briefcase,       href: "/bingoo?tab=portfolio",    color: "from-violet-500 to-violet-600" },
  { label: "Billing",      icon: CreditCard,      href: "/billing",                 color: "from-orange-500 to-orange-600" },
];

// Bottom tab bar items (most used)
const bottomTabs = [
  { label: "Home",     icon: Home,          href: "/bingoo",             color: "#3b82f6" },
  { label: "Profile",  icon: User,          href: "/bingoo?tab=profile", color: "#8b5cf6" },
  { label: "Devices",  icon: Smartphone,    href: "/bingoo?tab=devices", color: "#06b6d4" },
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

  const t = isDark ? {
    bg: "#0f1117",
    sidebar: "linear-gradient(180deg, #13161f 0%, #0d1018 100%)",
    sidebarBorder: "rgba(255,255,255,0.06)",
    headerBg: "#13161f",
    headerBorder: "rgba(255,255,255,0.06)",
    text: "text-white",
    textMuted: "text-white/30",
    activeLink: "rgba(255,255,255,0.12)",
    activeBorder: "rgba(255,255,255,0.3)",
    inactiveLink: "text-white/40 hover:text-white hover:bg-white/5",
    userBg: "bg-white/5",
    logoutHover: "hover:bg-white/10",
    mobileDrawer: "bg-black/60",
    drawerBg: "linear-gradient(180deg, #13161f 0%, #0d1018 100%)",
  } : {
    bg: "#f8fafc",
    sidebar: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
    sidebarBorder: "rgba(0,0,0,0.08)",
    headerBg: "#ffffff",
    headerBorder: "rgba(0,0,0,0.06)",
    text: "text-slate-900",
    textMuted: "text-slate-400",
    activeLink: "rgba(37,99,235,0.08)",
    activeBorder: "#2563eb",
    inactiveLink: "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
    userBg: "bg-slate-100",
    logoutHover: "hover:bg-red-50",
    mobileDrawer: "bg-black/40",
    drawerBg: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
  };

  const NavLink = ({ item, onNav }) => {
    const active = isActive(item.href);
    return (
      <Link to={item.href} onClick={onNav}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? (isDark ? "text-white" : "text-blue-700") : t.inactiveLink}`}
        style={active ? { background: t.activeLink, borderLeft: `3px solid ${t.activeBorder}` } : {}}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${active ? `bg-gradient-to-br ${item.color} shadow-md` : (isDark ? "bg-white/5 group-hover:bg-white/10" : "bg-slate-100 group-hover:bg-slate-200")}`}>
          <item.icon className={`w-4 h-4 ${active ? "text-white" : (isDark ? "text-white/50" : "text-slate-500")}`} />
        </div>
        {item.label}
        {active && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.4)" : "#2563eb" }} />}
      </Link>
    );
  };

  const SidebarContent = ({ onNav }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
          alt="Bingoo Connect" className="h-10 w-auto object-contain" />
        <div className={`text-[10px] uppercase tracking-widest mt-2 font-bold ${t.textMuted}`}>CONNECT • SHARE • GROW</div>
      </div>

      {/* Nav links - scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.label} item={item} onNav={onNav} />)}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/admin" ? "text-purple-600 bg-purple-50" : "text-purple-500 hover:bg-purple-50"}`}>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User + actions */}
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
        <button onClick={toggle}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all ${isDark ? "bg-white/8 text-white hover:bg-white/15 border border-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"}`}>
          {isDark ? <><Sun className="w-4 h-4 text-yellow-400" /> Light Mode</> : <><Moon className="w-4 h-4 text-slate-500" /> Dark Mode</>}
        </button>
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${t.userBg}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${t.text}`}>{user?.full_name}</p>
            <p className={`text-xs truncate ${t.textMuted}`}>{user?.email}</p>
          </div>
          <button onClick={() => base44.auth.logout()} title="Logout"
            className={`p-2 rounded-lg transition-colors ${t.logoutHover}`}>
            <LogOut className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors" />
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
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          background: t.headerBg,
          borderBottom: `1px solid ${t.headerBorder}`,
          paddingTop: "env(safe-area-inset-top)",
          marginTop: 0,
          height: "calc(56px + env(safe-area-inset-top))",
        }}>
        <img
          src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
          alt="Bingoo Connect" className="h-8 w-auto object-contain" />
        <div className="flex items-center gap-1">
          <button onClick={toggle}
            className={`p-2.5 rounded-xl transition-colors ${isDark ? "bg-white/10 text-yellow-300 hover:bg-white/15" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2.5 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
            {mobileOpen ? <X className={`w-5 h-5 ${t.text}`} /> : <Menu className={`w-5 h-5 ${t.text}`} />}
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
          background: t.headerBg,
          borderTop: `1px solid ${t.headerBorder}`,
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
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                  <item.icon className="w-5 h-5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>More</span>
              </button>
            );
          }
          const active = isActive(item.href);
          return (
            <Link key={item.label} to={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-[60px] active:opacity-60 transition-opacity">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: active ? `${item.color}20` : (isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9") }}>
                <item.icon className="w-5 h-5 transition-all" style={{ color: active ? item.color : (isDark ? "rgba(255,255,255,0.3)" : "#94a3b8") }} />
              </div>
              <span className="text-[10px] font-semibold transition-all"
                style={{ color: active ? item.color : (isDark ? "rgba(255,255,255,0.3)" : "#94a3b8") }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ── */}
      {/* Mobile: push content below top header and above bottom tab bar */}
      {/* Desktop: only offset by sidebar (ml-64), no top/bottom padding needed */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-x-hidden md:pt-0 md:pb-0"
        style={{ background: t.bg }}
      >
        {/* Mobile spacers via inline wrapper — avoids CSS var issues in Tailwind */}
        <div className="md:hidden" style={{ height: "calc(56px + env(safe-area-inset-top))" }} />
        {children}
        <div className="md:hidden" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      </main>
    </div>
  );
}