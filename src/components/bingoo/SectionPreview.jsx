/**
 * SectionPreview — lightweight section-specific previews for each editing tab.
 */
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  PhoneIcon, WhatsAppIcon, EmailIcon, WebsiteIcon,
  InstagramIcon, FacebookIcon, TikTokIcon, LinkedInIcon, YouTubeIcon,
} from "@/components/bingoo/BrandIcons";

// ── Avatar shape border-radius helper
const avatarRadius = (shape) => ({
  circle:   "50%",
  rounded:  "20%",
  squircle: "28%",
  card:     "12px",
}[shape] || "50%");

// ── PROFILE HEADER PREVIEW ─────────────────────────────────────────────────
export function ProfileHeaderPreview({ profile }) {
  const color = profile?.cover_color || "#2563eb";
  const buttonStyle = profile?.button_style || "pill";
  const br = { pill: "9999px", rounded: "14px", sharp: "4px", outlined: "14px", flat: "8px" }[buttonStyle] || "9999px";
  const avRadius = avatarRadius(profile?.avatar_shape);

  const primaryLinks = [
    profile?.whatsapp_number && { label: "WHATSAPP", Icon: WhatsAppIcon, bg: "linear-gradient(135deg,#25D366,#128C7E)" },
    profile?.phone           && { label: "CALL",      Icon: PhoneIcon,    bg: "linear-gradient(135deg,#16a34a,#15803d)" },
    profile?.email           && { label: "EMAIL",     Icon: EmailIcon,    bg: "linear-gradient(135deg,#6366f1,#4f46e5)" },
    profile?.website         && { label: "WEBSITE",   Icon: WebsiteIcon,  bg: `linear-gradient(135deg,${color},${color}bb)` },
  ].filter(Boolean);

  // Fall back to showing some placeholder buttons if nothing is filled in
  const displayLinks = primaryLinks.length > 0 ? primaryLinks : [
    { label: "WHATSAPP", Icon: WhatsAppIcon, bg: "linear-gradient(135deg,#25D366,#128C7E)" },
    { label: "CALL",     Icon: PhoneIcon,    bg: "linear-gradient(135deg,#16a34a,#15803d)" },
    { label: "EMAIL",    Icon: EmailIcon,    bg: "linear-gradient(135deg,#6366f1,#4f46e5)" },
    { label: "WEBSITE",  Icon: WebsiteIcon,  bg: `linear-gradient(135deg,${color},${color}bb)` },
  ];

  const socialLinks = [
    profile?.instagram_url && { Icon: InstagramIcon, label: "IG" },
    profile?.facebook_url  && { Icon: FacebookIcon,  label: "FB" },
    profile?.tiktok_url    && { Icon: TikTokIcon,    label: "TK" },
    profile?.linkedin_url  && { Icon: LinkedInIcon,  label: "LI" },
    profile?.youtube_url   && { Icon: YouTubeIcon,   label: "YT" },
  ].filter(Boolean);

  const cols = Math.min(displayLinks.length, 4);

  return (
    <div style={{ background: "#f1f5f9", padding: "10px 10px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
        {/* Cover photo */}
        <div style={{
          height: 120,
          background: profile?.cover_photo
            ? `url(${profile.cover_photo}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color}, ${color}88)`,
          position: "relative",
        }}>
          {/* Company logo badge (top-left) */}
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 10, left: 10, width: 36, height: 36, borderRadius: 8, overflow: "hidden", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", background: "#fff" }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
        </div>

        <div style={{ padding: "0 14px 14px" }}>
          {/* Avatar — overlapping cover */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: -34, marginBottom: 10 }}>
            {profile?.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: 68, height: 68, borderRadius: avRadius, objectFit: "cover", objectPosition: "center top", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }} />
              : <div style={{ width: 68, height: 68, borderRadius: avRadius, background: `linear-gradient(135deg,${color},${color}99)`, border: "3px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 24 }}>
                  {profile?.display_name?.charAt(0) || "?"}
                </div>
            }
          </div>

          {/* Name / title / company / bio */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h2 style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              {profile?.display_name || "Your Name"}
            </h2>
            {profile?.job_title && (
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color }}>{profile.job_title}</p>
            )}
            {profile?.company_name && (
              <p style={{ margin: "0 0 8px", fontSize: 10.5, color: "#64748b", fontWeight: 600 }}>{profile.company_name}</p>
            )}
            {profile?.bio && (
              <div style={{ textAlign: "left", fontSize: 10, lineHeight: 1.6, color: "#64748b", padding: "7px 10px", borderRadius: 10, background: `${color}0e`, border: `1px solid ${color}18`, marginBottom: 2 }}>
                {profile.bio.slice(0, 90)}{profile.bio.length > 90 ? "…" : ""}
              </div>
            )}
          </div>

          {/* Action button grid — exactly like the screenshot */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 5, marginBottom: 9 }}>
            {displayLinks.map(l => (
              <div key={l.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 4, padding: "9px 4px", borderRadius: 12, background: l.bg,
                color: "#fff", fontSize: 8, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.05em", minHeight: 60,
              }}>
                <l.Icon size={15} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Save Contact bar */}
          <div style={{ width: "100%", padding: "9px", borderRadius: br, background: "#0f172a", color: "#fff", fontSize: 10.5, fontWeight: 800, textAlign: "center", marginBottom: 10, letterSpacing: "0.02em" }}>
            💾 Save Contact
          </div>

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
              {socialLinks.map(({ Icon, label }) => (
                <div key={label} style={{ width: 34, height: 34, borderRadius: 9, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                  <Icon size={34} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DESIGN PREVIEW ─────────────────────────────────────────────────────────
export function DesignPreview({ profile }) {
  const color = profile?.cover_color || "#2563eb";
  const layout = profile?.layout || "classic";
  const buttonStyle = profile?.button_style || "pill";
  const bgStyle = profile?.bg_style || "clean";
  const br = { pill: "9999px", rounded: "12px", sharp: "4px", outlined: "12px", flat: "8px" }[buttonStyle] || "9999px";

  const bgMap = {
    clean: "#f8fafc",
    gradient: `linear-gradient(135deg, ${color}18, #f8fafc)`,
    mesh: `radial-gradient(circle at 20% 20%, ${color}22, transparent 50%), radial-gradient(circle at 80% 80%, #a855f722, transparent 50%), #f8fafc`,
    night: "linear-gradient(135deg,#0f172a,#1e293b)",
    blur: `linear-gradient(135deg, ${color}22, #e0e7ff)`,
    animated: `linear-gradient(135deg, ${color}33, #a855f733, #06b6d433)`,
  };

  return (
    <div className="min-h-screen p-3" style={{ background: bgMap[bgStyle] || bgMap.clean }}>
      {/* Layout + color badge */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/80 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
          {layout}
        </span>
        <span className="w-5 h-5 rounded-full border-2 border-white shadow flex-shrink-0" style={{ background: color }} />
        <span className="text-[10px] font-bold text-slate-500">{color}</span>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-3">
        {/* Cover preview */}
        <div className="w-full h-20"
          style={{
            background: profile?.cover_photo
              ? `url(${profile.cover_photo}) center/cover`
              : `linear-gradient(135deg, ${color}, ${color}88)`,
          }} />
        <div className="px-3 pb-3 pt-1 text-center">
          <div className="flex justify-center -mt-5 mb-1.5">
            {profile?.profile_photo
              ? <img src={profile.profile_photo} className="w-10 h-10 rounded-full border-3 border-white shadow object-cover" style={{ borderWidth: 3 }} alt="" />
              : <div className="w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center text-base font-black text-white" style={{ background: color }}>
                  {profile?.display_name?.charAt(0) || "?"}
                </div>
            }
          </div>
          <p className="font-black text-slate-900 text-sm">{profile?.display_name || "Your Name"}</p>
          {profile?.job_title && <p className="text-xs font-semibold" style={{ color }}>{profile.job_title}</p>}
        </div>
      </div>

      {/* Button style samples */}
      <div className="space-y-1.5 mb-3">
        <div className="w-full py-2 text-center text-xs font-bold text-white" style={{ background: color, borderRadius: br }}>
          💬 WhatsApp
        </div>
        <div className="w-full py-2 text-center text-xs font-bold" style={{
          background: buttonStyle === "outlined" ? "transparent" : `${color}22`,
          color,
          borderRadius: br,
          border: `2px solid ${color}44`,
        }}>
          📞 Call
        </div>
        <div className="w-full py-2 text-center text-xs font-bold bg-slate-800 text-white" style={{ borderRadius: br }}>
          💾 Save Contact
        </div>
      </div>

      {/* Palette + style info */}
      <div className="bg-white/70 rounded-xl p-2.5 text-xs text-slate-500 font-semibold space-y-1 border border-slate-100">
        <div className="flex justify-between"><span>Button Style</span><span className="text-slate-800 font-black capitalize">{buttonStyle}</span></div>
        <div className="flex justify-between"><span>Background</span><span className="text-slate-800 font-black capitalize">{bgStyle}</span></div>
        <div className="flex justify-between"><span>Layout</span><span className="text-slate-800 font-black capitalize">{layout}</span></div>
      </div>
    </div>
  );
}

// ── TEAM MEMBERS PREVIEW ───────────────────────────────────────────────────
export function TeamPreview({ profileId, isDark }) {
  const { data: members = [] } = useQuery({
    queryKey: ["team-preview", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId }, "order"),
    enabled: !!profileId,
  });

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";

  if (!members.length) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: bg }}>
      <div>
        <div className="text-4xl mb-3">👥</div>
        <p className="text-sm font-semibold text-slate-400">No team members yet</p>
        <p className="text-xs text-slate-400 mt-1">Add members to see them here</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3" style={{ background: bg }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Team Members</p>
      <div className="space-y-2">
        {members.slice(0, 6).map(m => (
          <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: cardBg }}>
            {m.photo
              ? <img src={m.photo} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
              : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 bg-gradient-to-br from-teal-500 to-teal-600">
                  {m.name?.charAt(0) || "?"}
                </div>
            }
            <div className="min-w-0">
              <p className="font-black text-xs" style={{ color: isDark ? "#fff" : "#0f172a" }}>{m.name}</p>
              {m.role && <p className="text-[10px] text-teal-500 font-semibold truncate">{m.role}</p>}
            </div>
            {m.status === "active" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
          </div>
        ))}
        {members.length > 6 && (
          <p className="text-center text-xs text-slate-400 font-semibold">+{members.length - 6} more</p>
        )}
      </div>
    </div>
  );
}

// ── SERVICES PREVIEW ───────────────────────────────────────────────────────
export function ServicesPreview({ profileId, isDark, isLawFirm }) {
  const { data: salonServices = [] } = useQuery({
    queryKey: ["salon-services-preview", profileId],
    queryFn: () => base44.entities.SalonService.filter({ profile_id: profileId, is_active: true }, "order"),
    enabled: !!profileId && !isLawFirm,
  });

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const services = salonServices;

  if (!services.length) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: bg }}>
      <div>
        <div className="text-4xl mb-3">✂️</div>
        <p className="text-sm font-semibold text-slate-400">No services yet</p>
        <p className="text-xs text-slate-400 mt-1">Add services to see them here</p>
      </div>
    </div>
  );

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <div className="min-h-screen p-3" style={{ background: bg }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Services</p>
      {categories.length > 0 ? categories.map(cat => (
        <div key={cat} className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-1.5">{cat}</p>
          <div className="space-y-1.5">
            {services.filter(s => s.category === cat).slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: cardBg }}>
                {s.image_url
                  ? <img src={s.image_url} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                  : <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 text-sm">✂️</div>
                }
                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs truncate" style={{ color: isDark ? "#fff" : "#0f172a" }}>{s.name}</p>
                  {s.duration_minutes && <p className="text-[10px] text-slate-400">{s.duration_minutes}min</p>}
                </div>
                {s.price_label && <p className="text-xs font-black text-green-600 flex-shrink-0">{s.price_label}</p>}
              </div>
            ))}
          </div>
        </div>
      )) : (
        <div className="space-y-1.5">
          {services.slice(0, 6).map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: cardBg }}>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 text-sm">✂️</div>
              <p className="font-black text-xs flex-1 truncate" style={{ color: isDark ? "#fff" : "#0f172a" }}>{s.name}</p>
              {s.price_label && <p className="text-xs font-black text-green-600 flex-shrink-0">{s.price_label}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PRACTICE AREAS PREVIEW ─────────────────────────────────────────────────
export function PracticeAreasPreview({ profileId, isDark }) {
  const { data: areas = [] } = useQuery({
    queryKey: ["practice-areas-preview", profileId],
    queryFn: () => base44.entities.PracticeArea.filter({ profile_id: profileId, is_active: true }, "order"),
    enabled: !!profileId,
  });

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";

  if (!areas.length) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: bg }}>
      <div>
        <div className="text-4xl mb-3">⚖️</div>
        <p className="text-sm font-semibold text-slate-400">No practice areas yet</p>
        <p className="text-xs text-slate-400 mt-1">Add areas to see them here</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3" style={{ background: bg }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Practice Areas</p>
      <div className="space-y-2">
        {areas.slice(0, 8).map(a => (
          <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: cardBg }}>
            <span className="text-base flex-shrink-0">{a.icon || "⚖️"}</span>
            <div className="min-w-0">
              <p className="font-black text-xs" style={{ color: isDark ? "#fff" : "#0f172a" }}>{a.name}</p>
              {a.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{a.description}</p>}
            </div>
          </div>
        ))}
        {areas.length > 8 && <p className="text-center text-xs text-slate-400 font-semibold">+{areas.length - 8} more</p>}
      </div>
    </div>
  );
}

// ── OFFICE LOCATIONS PREVIEW ───────────────────────────────────────────────
export function OfficeLocationsPreview({ profileId, isDark }) {
  const { data: locations = [] } = useQuery({
    queryKey: ["office-locations-preview", profileId],
    queryFn: () => base44.entities.OfficeLocation.filter({ profile_id: profileId, is_active: true }, "order"),
    enabled: !!profileId,
  });

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";

  if (!locations.length) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: bg }}>
      <div>
        <div className="text-4xl mb-3">📍</div>
        <p className="text-sm font-semibold text-slate-400">No locations yet</p>
        <p className="text-xs text-slate-400 mt-1">Add office locations to see them here</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3" style={{ background: bg }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Office Locations</p>
      <div className="space-y-2.5">
        {locations.map(loc => (
          <div key={loc.id} className="p-3 rounded-xl" style={{ background: cardBg }}>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{loc.is_primary ? "🏢" : "📍"}</span>
              <div>
                <p className="font-black text-xs" style={{ color: isDark ? "#fff" : "#0f172a" }}>{loc.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{loc.address}</p>
                {loc.city && <p className="text-[10px] text-slate-400">{loc.city}{loc.state ? `, ${loc.state}` : ""}</p>}
                {loc.hours && <p className="text-[10px] text-red-400 font-semibold mt-0.5">🕐 {loc.hours}</p>}
              </div>
              {loc.is_primary && <span className="ml-auto text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black flex-shrink-0">PRIMARY</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}