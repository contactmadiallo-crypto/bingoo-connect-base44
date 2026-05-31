import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, User, Smartphone, BarChart3, CreditCard, LogOut, Star, Shield, Menu, X, CalendarDays, Zap } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/bingoo",                  color: "from-blue-500 to-blue-600" },
  { label: "My Profile",   icon: User,            href: "/bingoo?tab=profile",       color: "from-violet-500 to-violet-600" },
  { label: "Appointments", icon: CalendarDays,    href: "/bingoo?tab=appointments",  color: "from-emerald-500 to-emerald-600" },
  { label: "Leads",        icon: Star,            href: "/bingoo?tab=leads",         color: "from-amber-500 to-amber-600" },
  { label: "My Devices",   icon: Smartphone,      href: "/bingoo?tab=devices",       color: "from-cyan-500 to-cyan-600" },
  { label: "Analytics",    icon: BarChart3,       href: "/bingoo?tab=analytics",     color: "from-pink-500 to-pink-600" },
  { label: "Upgrade",      icon: CreditCard,      href: "/pricing",                  color: "from-orange-500 to-orange-600" },
];

function NavLink({ item, active, onClick }) {
  return (
    <Link key={item.label} to={item.href} onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? "text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
      style={active ? { background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))", borderLeft: "3px solid rgba(255,255,255,0.5)" } : {}}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${active ? `bg-gradient-to-br ${item.color} shadow-md` : "bg-white/5 group-hover:bg-white/10"}`}>
        <item.icon className="w-3.5 h-3.5 text-white" />
      </div>
      {item.label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
    </Link>
  );
}

export default function BingooLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const isActive = (href) =>
    location.pathname + location.search === href ||
    (href.includes("?") ? location.search === "?" + href.split("?")[1] && location.pathname === "/bingoo" : location.pathname === href && !location.search);

  const SidebarContent = ({ onNav }) => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="font-black text-white text-lg leading-none">Bingoo<span className="text-blue-400">Connect</span></div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Digital Identity</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.label} item={item} active={isActive(item.href)} onClick={onNav} />
        ))}
        {isAdmin && (
          <Link to="/admin" onClick={onNav}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/admin" ? "text-white bg-white/10" : "text-purple-400 hover:text-white hover:bg-white/5"}`}>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
            </div>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-white/30 truncate">{user?.email}</p>
          </div>
          <button onClick={() => base44.auth.logout()} title="Logout" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4 text-white/30 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#0f1117" }}>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-20"
        style={{ background: "linear-gradient(180deg, #13161f 0%, #0d1018 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <SidebarContent onNav={null} />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "#13161f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-black text-white">Bingoo<span className="text-blue-400">Connect</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="flex flex-col w-64 h-full shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ background: "linear-gradient(180deg, #13161f 0%, #0d1018 100%)" }}>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen" style={{ background: "#0f1117" }}>
        {children}
      </main>
    </div>
  );
}