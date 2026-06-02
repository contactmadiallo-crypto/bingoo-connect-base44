import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, User, Smartphone, BarChart3, CreditCard, LogOut, Star, Shield, Menu, X, CalendarDays, Zap, Briefcase, Sun, Moon, Home } from "lucide-react";
import { useState } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const navItems = [
  { label: "Home",        icon: Home,          href: "/",                         color: "from-slate-500 to-slate-600" },
  { label: "Dashboard",    icon: LayoutDashboard, href: "/bingoo",                  color: "from-blue-500 to-blue-600" },
  { label: "My Profile",   icon: User,            href: "/bingoo?tab=profile",       color: "from-violet-500 to-violet-600" },
  { label: "Appointments", icon: CalendarDays,    href: "/bingoo?tab=appointments",  color: "from-emerald-500 to-emerald-600" },
  { label: "Leads",        icon: Star,            href: "/bingoo?tab=leads",         color: "from-amber-500 to-amber-600" },
  { label: "My Devices",   icon: Smartphone,      href: "/bingoo?tab=devices",       color: "from-cyan-500 to-cyan-600" },
  { label: "NFC Devices",  icon: Smartphone,      href: "/my-nfc-devices",            color: "from-teal-500 to-teal-600" },
  { label: "Analytics",    icon: BarChart3,       href: "/bingoo?tab=analytics",     color: "from-pink-500 to-pink-600" },
  { label: "Portfolio",    icon: Briefcase,       href: "/bingoo?tab=portfolio",     color: "from-violet-500 to-violet-600" },
  { label: "Upgrade",      icon: CreditCard,      href: "/pricing",                  color: "from-orange-500 to-orange-600" },
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
    if (href.includes("?")) {
      return location.pathname === "/bingoo" && location.search === "?" + href.split("?")[1];
    }
    return location.pathname === href && !location.search;
  };

  // Theme tokens
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
    iconColor: "text-white",
    mobileDrawer: "bg-black/60",
    drawerBg: "linear-gradient(180deg, #13161f 0%, #0d1018 100%)",
  } : {
    bg: "#f8fafc",
    sidebar: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
    sidebarBorder: "rgba(0,0,0,0.08)",
    headerBg: "#ffffff",
    headerBorder: "rgba(0,0,0,0.08)",
    text: "text-slate-900",
    textMuted: "text-slate-400",
    activeLink: "rgba(37,99,235,0.08)",
    activeBorder: "#2563eb",
    inactiveLink: "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
    userBg: "bg-slate-100",
    logoutHover: "hover:bg-red-50",
    iconColor: "text-slate-700",
    mobileDrawer: "bg-black/40",
    drawerBg: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
  };

  const NavLink = ({ item, onNav }) => {
    const active = isActive(item.href);
    return (
      <Link to={item.href} onClick={onNav}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? (isDark ? "text-white" : "text-blue-700") : t.inactiveLink}`}
        style={active ? { background: t.activeLink, borderLeft: `3px solid ${t.activeBorder}` } : {}}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${active ? `bg-gradient-to-br ${item.color} shadow-md` : (isDark ? "bg-white/5 group-hover:bg-white/10" : "bg-slate-100 group-hover:bg-slate-200")}`}>
          <item.icon className={`w-3.5 h-3.5 ${active ? "text-white" : (isDark ? "text-white/50" : "text-slate-500")}`} />
        </div>
        {item.label}
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.4)" : "#2563eb" }} />}
      </Link>
    );
  };

  const SidebarContent = ({ onNav }) => (
    <>
      <div className="px-5 py-6" style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className={`font-black text-lg leading-none ${t.text}`}>Bingoo<span className="text-blue-500">Connect</span></div>
            <div className={`text-[10px] uppercase tracking-widest mt-0.5 ${t.textMuted}`}>Digital Identity</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.label} item={item} onNav={onNav} />)}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/admin" ? "text-purple-600 bg-purple-50" : "text-purple-500 hover:bg-purple-50"}`}>
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
            </div>
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="px-3 py-3" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
        {/* Theme toggle */}
        <button onClick={toggle}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold mb-2 transition-all ${isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}>
          {isDark ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
        </button>

        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${t.userBg}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${t.text}`}>{user?.full_name}</p>
            <p className={`text-xs truncate ${t.textMuted}`}>{user?.email}</p>
          </div>
          <button onClick={() => base44.auth.logout()} title="Logout" className={`p-1.5 rounded-lg transition-colors ${t.logoutHover}`}>
            <LogOut className={`w-4 h-4 ${t.textMuted} hover:text-red-500 transition-colors`} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: t.bg }}>
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-20"
        style={{ background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}` }}>
        <SidebarContent onNav={null} />
      </aside>

      <header className="md:hidden fixed top-0 inset-x-0 z-30 px-4 flex items-center justify-between safe-top"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, paddingTop: `calc(0.75rem + env(safe-area-inset-top))`, paddingBottom: "0.75rem" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className={`font-black ${t.text}`}>Bingoo<span className="text-blue-500">Connect</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
            {mobileOpen ? <X className={`w-5 h-5 ${t.text}`} /> : <Menu className={`w-5 h-5 ${t.text}`} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className={`md:hidden fixed inset-0 z-20 backdrop-blur-sm ${t.mobileDrawer}`} onClick={() => setMobileOpen(false)}>
          <div className="flex flex-col w-64 h-full shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ background: t.drawerBg }}>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around"
        style={{ background: t.headerBg, borderTop: `1px solid ${t.headerBorder}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[
          { label: "Home",      icon: Home,          href: "/bingoo",                  color: "#3b82f6" },
          { label: "Profile",   icon: User,          href: "/bingoo?tab=profile",       color: "#8b5cf6" },
          { label: "Devices",   icon: Smartphone,    href: "/bingoo?tab=devices",       color: "#06b6d4" },
          { label: "Analytics", icon: BarChart3,     href: "/bingoo?tab=analytics",     color: "#ec4899" },
          { label: "More",      icon: Menu,          href: null,                        color: "#64748b" },
        ].map((item) => {
          if (item.href === null) {
            return (
              <button key="more" onClick={() => setMobileOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[60px]">
                <item.icon className="w-5 h-5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }} />
                <span className="text-[10px] font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>More</span>
              </button>
            );
          }
          const active = isActive(item.href);
          return (
            <Link key={item.label} to={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[60px] transition-all">
              <item.icon className="w-5 h-5 transition-all" style={{ color: active ? item.color : (isDark ? "rgba(255,255,255,0.3)" : "#94a3b8") }} />
              <span className="text-[10px] font-semibold transition-all" style={{ color: active ? item.color : (isDark ? "rgba(255,255,255,0.3)" : "#94a3b8") }}>{item.label}</span>
              {active && <span className="w-1 h-1 rounded-full" style={{ background: item.color }} />}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-safe md:pb-0 min-h-screen" style={{ background: t.bg }}>
        {children}
      </main>
    </div>
  );
}