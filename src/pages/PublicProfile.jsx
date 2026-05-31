import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import RequestInfoModal from "@/components/bingoo/RequestInfoModal";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const trackEvent = (profileId, eventType) => {
  base44.entities.Analytics.create({
    profile_id: profileId,
    event_type: eventType,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
};

const generateVCF = (profile) => {
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${profile.display_name || ""}`,
    `N:${(profile.display_name || "").split(" ").slice(1).join(" ")};${(profile.display_name || "").split(" ")[0]};;;`,
    profile.company_name ? `ORG:${profile.company_name}` : "",
    profile.job_title ? `TITLE:${profile.job_title}` : "",
    profile.phone ? `TEL;TYPE=VOICE:${profile.phone}` : "",
    profile.whatsapp_number ? `TEL;TYPE=CELL:${profile.whatsapp_number}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : "",
    profile.location && profile.show_location !== false ? `ADR:;;${profile.location};;;;` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
  const blob = new Blob([lines], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf`; a.click();
  URL.revokeObjectURL(url);
};

const Avatar = ({ profile, size = 96 }) => {
  const cls = `rounded-full object-cover border-4 border-white shadow-xl`;
  const style = { width: size, height: size, flexShrink: 0 };
  return profile.profile_photo ? (
    <img src={profile.profile_photo} alt={profile.display_name} className={cls} style={style} />
  ) : (
    <div className={`${cls} flex items-center justify-center font-black text-white`}
      style={{ ...style, background: profile.cover_color || "#2563eb", fontSize: size * 0.38 }}>
      {profile.display_name?.charAt(0) || "?"}
    </div>
  );
};

const useProfileLinks = (profile) => {
  const primary = [
    profile?.whatsapp_number && { emoji: "💬", label: "WhatsApp", href: `https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}`, event: "whatsapp_click" },
    profile?.phone && { emoji: "📞", label: "Call", href: `tel:${profile.phone}`, event: "phone_click" },
    profile?.email && { emoji: "📧", label: "Email", href: `mailto:${profile.email}`, event: "email_click" },
  ].filter(Boolean);

  const secondary = [
    profile?.instagram_url && { emoji: "📸", label: "Instagram", href: profile.instagram_url, event: "instagram_click" },
    profile?.facebook_url && { emoji: "👤", label: "Facebook", href: profile.facebook_url, event: "facebook_click" },
    profile?.tiktok_url && { emoji: "🎵", label: "TikTok", href: profile.tiktok_url, event: "tiktok_click" },
    profile?.linkedin_url && { emoji: "💼", label: "LinkedIn", href: profile.linkedin_url, event: "linkedin_click" },
    profile?.youtube_url && { emoji: "▶️", label: "YouTube", href: profile.youtube_url, event: "youtube_click" },
    profile?.website && { emoji: "🌐", label: "Website", href: profile.website, event: "website_click" },
    profile?.location && profile?.show_location !== false && { emoji: "📍", label: "Address", href: `https://maps.google.com/?q=${encodeURIComponent(profile.location)}`, event: "location_click" },
    profile?.payment_link && { emoji: "💳", label: "Pay / Support", href: profile.payment_link, event: "payment_click" },
  ].filter(Boolean);

  return { primary, secondary };
};

// ── Shared Action Block ──────────────────────────────────────────────────────
function ActionBlock({ profile, track, color, darkMode = false }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const soft = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const softBorder = darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  return (
    <div className="space-y-2.5 w-full">
      <button onClick={() => { track("save_contact_click"); generateVCF(profile); }}
        className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] hover:opacity-90 shadow-lg"
        style={{ background: color, color: "#fff", boxShadow: `0 8px 24px ${color}40` }}>
        <span className="text-base">💾</span> Save Contact
      </button>

      <div className={`grid gap-2 ${profile.booking_enabled ? "grid-cols-2" : "grid-cols-1"}`}>
        <button onClick={() => setInfoOpen(true)}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] border-2"
          style={{ borderColor: color, color, background: "transparent" }}>
          <span>📋</span> Request Info
        </button>
        {profile.booking_enabled && (
          <button onClick={() => setBookOpen(true)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ background: soft, color, border: `1px solid ${softBorder}` }}>
            <span>📅</span> Book a Meeting
          </button>
        )}
      </div>

      {infoOpen && <RequestInfoModal profileId={profile.id} onClose={() => setInfoOpen(false)} />}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}
    </div>
  );
}

// ── Secondary Link Row ───────────────────────────────────────────────────────
function SecondaryLink({ emoji, label, href, onClick, darkMode }) {
  const hoverBg = darkMode ? "hover:bg-white/10" : "hover:bg-slate-50";
  const textColor = darkMode ? "text-white/80" : "text-slate-700";
  const borderColor = darkMode ? "border-white/10" : "border-slate-100";
  const chevronColor = darkMode ? "text-white/20" : "text-slate-300";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
      className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.99] ${borderColor} ${hoverBg}`}>
      <span className="text-xl w-7 text-center">{emoji}</span>
      <span className={`font-semibold text-sm flex-1 ${textColor}`}>{label}</span>
      <svg className={`w-4 h-4 ${chevronColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

// ── Primary CTA Grid ─────────────────────────────────────────────────────────
function PrimaryButtons({ links, color, track, darkMode }) {
  if (!links.length) return null;
  const softBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  return (
    <div className={`grid gap-2.5 ${links.length === 1 ? "grid-cols-1" : links.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {links.map(l => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.event)}
          className="flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all active:scale-[0.97] hover:opacity-90"
          style={{ background: color, color: "#fff" }}>
          <span className="text-2xl leading-none">{l.emoji}</span>
          <span className="text-[11px] font-bold uppercase tracking-wide">{l.label}</span>
        </a>
      ))}
    </div>
  );
}

// ── CLASSIC ──────────────────────────────────────────────────────────────────
function LayoutClassic({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4"
      style={{ background: `linear-gradient(170deg, ${color}12 0%, #f8fafc 55%)` }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: `0 32px 80px -12px ${color}28, 0 12px 32px -8px rgba(0,0,0,0.12)` }}>

          {/* Cover + Avatar */}
          <div className="relative" style={{ paddingBottom: 56 }}>
            <div className="h-36 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute top-5 right-6 w-12 h-12 rounded-full bg-white/10" />
              {profile.company_logo && (
                <img src={profile.company_logo} className="absolute top-4 left-5 h-9 object-contain" style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }} alt="Logo" />
              )}
            </div>
            <div className="absolute bottom-0 left-6">
              <Avatar profile={profile} size={88} />
            </div>
            {profile.plan !== "free" && (
              <div className="absolute bottom-4 right-6">
                <span className="text-xs font-black px-3 py-1.5 rounded-full text-white tracking-widest uppercase" style={{ background: color }}>PRO</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pt-3 pb-8 space-y-5">
            {/* Identity */}
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight mt-1">{profile.display_name}</h1>
              {profile.job_title && (
                <p className="text-sm font-bold mt-1" style={{ color }}>{profile.job_title}</p>
              )}
              {profile.company_name && (
                <p className="text-slate-400 text-sm mt-0.5 font-medium">at {profile.company_name}</p>
              )}
              {profile.bio && (
                <p className="text-slate-500 text-sm leading-relaxed mt-3 pl-3 border-l-2" style={{ borderColor: `${color}60` }}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Actions */}
            <div className="space-y-2.5">
              <PrimaryButtons links={primary} color={color} track={track} />
              <ActionBlock profile={profile} track={track} color={color} />
            </div>

            {/* Social / secondary links */}
            {secondary.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-1">More</p>
                {secondary.map(l => (
                  <SecondaryLink key={l.label} {...l} onClick={() => track(l.event)} />
                ))}
              </div>
            )}

            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-5">
          Powered by <a href="/" className="font-bold hover:underline" style={{ color }}>Bingoo Connect</a>
        </p>
      </div>
    </div>
  );
}

// ── MINIMAL ───────────────────────────────────────────────────────────────────
function LayoutMinimal({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen bg-white flex items-start justify-center py-10 px-5">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar profile={profile} size={72} />
          <div className="flex-1 pt-1">
            <h1 className="text-xl font-black text-slate-900 leading-snug">{profile.display_name}</h1>
            {profile.job_title && <p className="text-sm font-bold mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-slate-400 text-xs mt-0.5">{profile.company_name}</p>}
          </div>
        </div>
        {profile.bio && <p className="text-slate-500 text-sm leading-relaxed pl-3 border-l-2" style={{ borderColor: `${color}60` }}>{profile.bio}</p>}

        <div className="h-px bg-slate-100" />

        <div className="space-y-2.5">
          <PrimaryButtons links={primary} color={color} track={track} />
          <ActionBlock profile={profile} track={track} color={color} />
        </div>
        {secondary.length > 0 && (
          <div className="space-y-2">
            {secondary.map(l => <SecondaryLink key={l.label} {...l} onClick={() => track(l.event)} />)}
          </div>
        )}
        <PortfolioSection profileId={profile.id} color={color} />
        <p className="text-center text-slate-300 text-xs pt-2">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── DARK ──────────────────────────────────────────────────────────────────────
function LayoutDark({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4"
      style={{ background: "linear-gradient(160deg, #0a0c18 0%, #0f1020 100%)" }}>
      {/* ambient glow */}
      <div className="fixed inset-x-0 top-0 h-80 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% -20%, ${color}35 0%, transparent 70%)` }} />

      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(24px)", boxShadow: `0 32px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px ${color}20` }}>

          {/* Cover */}
          <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}70 0%, ${color}30 100%)` }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
            {profile.company_logo && <img src={profile.company_logo} className="absolute top-4 left-5 h-8 object-contain opacity-70" alt="Logo" />}
            <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, rgba(10,12,24,0.6))" }} />
          </div>

          <div className="px-6 pb-8">
            <div className="flex items-end justify-between -mt-11 mb-5">
              <div style={{ border: "3px solid rgba(10,12,24,0.9)", borderRadius: "50%" }}>
                <Avatar profile={profile} size={80} />
              </div>
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{profile.display_name}</h1>
            {profile.job_title && <p className="font-bold text-sm mt-1" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-white/35 text-sm mt-0.5">{profile.company_name}</p>}
            {profile.bio && <p className="text-white/50 text-sm leading-relaxed mt-3">{profile.bio}</p>}

            <div className="my-5 border-t border-white/8" />

            <div className="space-y-2.5">
              <PrimaryButtons links={primary} color={color} track={track} darkMode />
              <ActionBlock profile={profile} track={track} color={color} darkMode />
            </div>

            {secondary.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">More</p>
                {secondary.map(l => <SecondaryLink key={l.label} {...l} onClick={() => track(l.event)} darkMode />)}
              </div>
            )}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-5">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── BOLD ──────────────────────────────────────────────────────────────────────
function LayoutBold({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen flex items-start justify-center py-10 px-4"
      style={{ background: `linear-gradient(150deg, ${color} 0%, ${color}aa 40%, #f8fafc 100%)` }}>
      <div className="w-full max-w-sm space-y-4">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <Avatar profile={profile} size={96} />
          </div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm">{profile.display_name}</h1>
          {profile.job_title && <p className="text-white/80 font-semibold text-sm mt-1">{profile.job_title}</p>}
          {profile.company_name && <p className="text-white/55 text-sm mt-0.5 font-medium">{profile.company_name}</p>}
          {profile.bio && <p className="text-white/65 text-sm mt-3 leading-relaxed max-w-xs mx-auto">{profile.bio}</p>}
        </div>

        {/* Action card */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-5 border border-white/25 space-y-2.5"
          style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.15)" }}>
          <PrimaryButtons links={primary} color={color} track={track} darkMode />
          <ActionBlock profile={profile} track={track} color={color} darkMode />
          {secondary.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.event)}
              className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 transition-all text-white font-semibold text-sm">
              <span className="text-xl">{l.emoji}</span>{l.label}
            </a>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/15">
          <PortfolioSection profileId={profile.id} color="#fff" />
        </div>

        <p className="text-center text-white/35 text-xs pb-2">Powered by <a href="/" className="font-bold text-white/60">Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── SPLIT ─────────────────────────────────────────────────────────────────────
function LayoutSplit({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl"
          style={{ boxShadow: `0 24px 60px -8px rgba(0,0,0,0.12), 4px 0 0 0 ${color} inset` }}>
          <div className="pl-6 pr-6 pt-7 pb-8 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar profile={profile} size={72} />
              <div className="flex-1">
                <h1 className="text-xl font-black text-slate-900 leading-tight">{profile.display_name}</h1>
                {profile.job_title && <p className="text-sm font-bold mt-0.5" style={{ color }}>{profile.job_title}</p>}
                {profile.company_name && <p className="text-slate-400 text-xs mt-0.5">{profile.company_name}</p>}
              </div>
            </div>

            {profile.bio && (
              <p className="text-slate-500 text-sm leading-relaxed">{profile.bio}</p>
            )}

            <div className="h-px bg-slate-100" />

            <div className="space-y-2.5">
              <PrimaryButtons links={primary} color={color} track={track} />
              <ActionBlock profile={profile} track={track} color={color} />
            </div>

            {secondary.length > 0 && (
              <div className="space-y-2">
                {secondary.map(l => <SecondaryLink key={l.label} {...l} onClick={() => track(l.event)} />)}
              </div>
            )}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-5">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LAYOUTS = { classic: LayoutClassic, minimal: LayoutMinimal, dark: LayoutDark, bold: LayoutBold, split: LayoutSplit };

export default function PublicProfile() {
  const { username } = useParams();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => base44.entities.Profile.filter({ username }),
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id) trackEvent(profile.id, "profile_view");
  }, [profile?.id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading profile…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile not found</h2>
        <p className="text-slate-500 text-sm">This link may be inactive or the username is incorrect.</p>
      </div>
    </div>
  );

  const track = (eventType) => trackEvent(profile.id, eventType);
  const Layout = LAYOUTS[profile.layout || "classic"] || LayoutClassic;
  return <Layout profile={profile} track={track} />;
}