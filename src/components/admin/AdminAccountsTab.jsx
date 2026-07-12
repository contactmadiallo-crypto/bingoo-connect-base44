import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Search, ChevronLeft, QrCode, Smartphone, Package, CreditCard,
  Star, CheckCircle2, Headphones, Mail, Phone, ExternalLink, User,
} from "lucide-react";
import { PLAN_LABELS } from "@/lib/planPermissions";

/**
 * AdminAccountsTab — Account-first admin view.
 * Lists all accounts (users). Clicking an account shows a drill-down
 * with their profiles, devices, assets, subscription, leads, appointments,
 * and support tickets.
 *
 * Props: users, profiles, devices, subscriptions, leads, appointments (from AdminDashboard)
 */
export default function AdminAccountsTab({ users = [], profiles = [], devices = [], subscriptions = [], leads = [], appointments = [] }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch assets and support tickets (admin RLS allows full read)
  const { data: assets = [] } = useQuery({
    queryKey: ["admin-assets-accounts"],
    queryFn: () => base44.entities.AssetItem.list("-created_date", 500),
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-tickets-accounts"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 200),
  });

  // Build account rows with summary counts
  const accountRows = users.map(u => {
    const userProfiles = profiles.filter(p =>
      p.created_by_id === u.id ||
      (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id)) ||
      (p.email && p.email === u.email)
    );
    const profileIds = new Set(userProfiles.map(p => p.id));
    const userDevices = devices.filter(d => profileIds.has(d.profile_id));
    const userAssets = assets.filter(a => a.owner_user_id === u.id);
    const sub = subscriptions.find(s => s.customer_email?.toLowerCase() === u.email?.toLowerCase());
    const userLeads = leads.filter(l => profileIds.has(l.profile_id));
    const userAppointments = appointments.filter(a => profileIds.has(a.profile_id));
    const userTickets = tickets.filter(t => t.user_id === u.id);
    return {
      user: u, profiles: userProfiles, devices: userDevices, assets: userAssets,
      sub, leads: userLeads, appointments: userAppointments, tickets: userTickets,
    };
  });

  const filtered = accountRows.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.user.full_name?.toLowerCase().includes(q) || r.user.email?.toLowerCase().includes(q);
  });

  // ── Account detail view ──
  const selected = selectedUserId ? accountRows.find(r => r.user.id === selectedUserId) : null;

  if (selected) {
    const u = selected.user;
    const plan = selected.sub?.plan || (selected.profiles[0]?.plan) || "free";
    const planLabel = PLAN_LABELS[plan] || plan;

    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedUserId(null)}
          className="flex items-center gap-2 text-sm font-bold transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft className="w-4 h-4" /> Back to Accounts
        </button>

        {/* Account header */}
        <div className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
            {u.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-white">{u.full_name || "—"}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: u.role === "admin" ? "rgba(253,186,33,0.15)" : "rgba(255,255,255,0.07)", color: u.role === "admin" ? "#FDBA21" : "rgba(255,255,255,0.4)", border: `1px solid ${u.role === "admin" ? "rgba(253,186,33,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                {u.role || "user"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                {planLabel}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{u.email}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
              Joined {u.created_date ? new Date(u.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        {/* Summary stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Profiles", value: selected.profiles.length, icon: QrCode, color: "#f97316" },
            { label: "Devices", value: selected.devices.length, icon: Smartphone, color: "#8b5cf6" },
            { label: "Assets", value: selected.assets.length, icon: Package, color: "#06b6d4" },
            { label: "Leads", value: selected.leads.length, icon: Star, color: "#22c55e" },
            { label: "Appts", value: selected.appointments.length, icon: CheckCircle2, color: "#FDBA21" },
            { label: "Tickets", value: selected.tickets.length, icon: Headphones, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 border text-center"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout: profiles+devices | subscription+activity */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Profiles + Devices */}
          <div className="space-y-4">
            {/* Profiles */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <h4 className="text-sm font-black text-white flex items-center gap-2"><QrCode className="w-4 h-4 text-orange-400" /> Profiles ({selected.profiles.length})</h4>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {selected.profiles.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.2)" }}>No profiles</p>
                ) : selected.profiles.map(p => (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {p.profile_photo
                      ? <img src={p.profile_photo} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0" style={{ background: p.cover_color || "#334155" }}>{p.display_name?.charAt(0) || "?"}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{p.display_name}</p>
                      <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>/{p.username}</p>
                    </div>
                    <a href={`/p/${p.username}`} target="_blank" rel="noopener" className="text-xs font-bold flex items-center gap-1" style={{ color: "#f97316" }}>
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <h4 className="text-sm font-black text-white flex items-center gap-2"><Smartphone className="w-4 h-4 text-violet-400" /> Devices ({selected.devices.length})</h4>
              </div>
              <div>
                {selected.devices.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.2)" }}>No devices</p>
                ) : selected.devices.map(d => (
                  <div key={d.id} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: d.status === "lost" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)" }}>
                      <Smartphone className={`w-4 h-4 ${d.status === "lost" ? "text-red-400" : "text-white/50"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white font-mono">{d.device_code}</p>
                      <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{d.product_name || d.device_type}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                      style={{ background: d.status === "lost" ? "rgba(239,68,68,0.15)" : d.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: d.status === "lost" ? "#ef4444" : d.status === "active" ? "#22c55e" : "rgba(255,255,255,0.4)" }}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assets */}
            {selected.assets.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-black text-white flex items-center gap-2"><Package className="w-4 h-4 text-cyan-400" /> Assets ({selected.assets.length})</h4>
                </div>
                <div>
                  {selected.assets.map(a => (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {a.photo_url
                        ? <img src={a.photo_url} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                        : <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}><Package className="w-4 h-4 text-white/50" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{a.name}</p>
                        <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{a.asset_type}{a.lost_mode_enabled ? " · LOST" : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Subscription + Activity */}
          <div className="space-y-4">
            {/* Subscription */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <h4 className="text-sm font-black text-white flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-400" /> Subscription</h4>
              </div>
              <div className="p-4 space-y-2">
                {selected.sub ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Plan</span>
                      <span className="font-bold text-white">{PLAN_LABELS[selected.sub.plan] || selected.sub.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Status</span>
                      <span className="font-bold capitalize" style={{ color: selected.sub.status === "active" ? "#22c55e" : "rgba(255,255,255,0.6)" }}>{selected.sub.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Source</span>
                      <span className="font-bold text-white">{selected.sub.plan_source || (selected.sub.stripe_subscription_id ? "stripe" : "manual")}</span>
                    </div>
                    {selected.sub.stripe_subscription_id && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>Stripe ID</span>
                        <span className="font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{selected.sub.stripe_subscription_id.slice(0, 14)}…</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-center py-3" style={{ color: "rgba(255,255,255,0.2)" }}>No subscription record</p>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            {selected.leads.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-black text-white flex items-center gap-2"><Star className="w-4 h-4 text-green-400" /> Recent Leads ({selected.leads.length})</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {selected.leads.slice(0, 5).map(l => (
                    <div key={l.id} className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0" style={{ background: "#f97316" }}>{l.name?.charAt(0) || "?"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{l.name || "Anonymous"}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{l.created_date?.slice(0, 10)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Appointments */}
            {selected.appointments.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-black text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Appointments ({selected.appointments.length})</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {selected.appointments.slice(0, 5).map(a => (
                    <div key={a.id} className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{a.visitor_name || "—"}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{a.date} {a.time_slot}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Tickets */}
            {selected.tickets.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <h4 className="text-sm font-black text-white flex items-center gap-2"><Headphones className="w-4 h-4 text-red-400" /> Support ({selected.tickets.length})</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {selected.tickets.slice(0, 5).map(t => (
                    <div key={t.id} className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <p className="text-sm font-bold text-white truncate">{t.subject}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{t.created_date?.slice(0, 10)} · {t.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Account list view ──
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
          placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
            <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>No accounts found</p>
          </div>
        ) : filtered.map(({ user: u, profiles: up, devices: ud, assets: ua, leads: ul, appointments: ua2, tickets: ut, sub }) => {
          const plan = sub?.plan || up[0]?.plan || "free";
          return (
            <button key={u.id} onClick={() => setSelectedUserId(u.id)}
              className="w-full px-5 py-4 flex items-center gap-3 text-left transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
                {u.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-white text-sm">{u.full_name || "—"}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                    {PLAN_LABELS[plan] || plan}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{u.email}</p>
              </div>
              {/* Summary counts */}
              <div className="hidden sm:flex items-center gap-3 text-xs flex-shrink-0">
                {[
                  { label: "P", value: up.length, color: "#f97316" },
                  { label: "D", value: ud.length, color: "#8b5cf6" },
                  { label: "A", value: ua.length, color: "#06b6d4" },
                  { label: "L", value: ul.length, color: "#22c55e" },
                ].map(s => (
                  <div key={s.label} className="text-center" style={{ minWidth: 28 }}>
                    <p className="font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <ChevronLeft className="w-4 h-4 rotate-180 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}