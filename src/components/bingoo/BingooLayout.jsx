import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, User, Smartphone, BarChart3, CreditCard, LogOut, Star, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/bingoo" },
  { label: "My Profile", icon: User, href: "/bingoo?tab=profile" },
  { label: "Leads", icon: Star, href: "/bingoo?tab=leads" },
  { label: "My Devices", icon: Smartphone, href: "/bingoo?tab=devices" },
  { label: "Analytics", icon: BarChart3, href: "/bingoo?tab=analytics" },
  { label: "Upgrade", icon: CreditCard, href: "/pricing" },
];

export default function BingooLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-20">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">B</span>
          </div>
          <div>
            <span className="font-black text-slate-900 text-lg">Bingoo</span>
            <span className="text-blue-600 font-black text-lg">Connect</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname + location.search === item.href || location.pathname === item.href.split("?")[0];
            return (
              <Link key={item.label} to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/admin" ? "bg-purple-600 text-white" : "text-purple-600 hover:bg-purple-50"}`}>
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={() => base44.auth.logout()} title="Logout">
              <LogOut className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xs">B</span>
          </div>
          <span className="font-black text-slate-900">Bingoo<span className="text-blue-600">Connect</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-100">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl p-4 space-y-1" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-3 pb-4 mb-2 border-b border-slate-100">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xs">B</span>
              </div>
              <span className="font-black text-slate-900">Bingoo<span className="text-blue-600">Connect</span></span>
            </div>
            {navItems.map(item => (
              <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50">
                <Shield className="w-4 h-4" /> Admin Panel
              </Link>
            )}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <button onClick={() => base44.auth.logout()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}