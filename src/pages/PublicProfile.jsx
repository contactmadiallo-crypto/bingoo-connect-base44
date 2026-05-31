import { useParams } from "react-router-dom";
import { useState } from "react";
import RequestInfoModal from "@/components/bingoo/RequestInfoModal";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

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
    profile.location ? `ADR:;;${profile.location};;;;` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
  const blob = new Blob([lines], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf`; a.click();
  URL.revokeObjectURL(url);
};

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar = ({ profile, size = "lg" }) => {
  const sz = size === "lg" ? "w-24 h-24 text-4xl" : size === "xl" ? "w-32 h-32 text-5xl" : "w-16 h-16 text-2xl";
  return profile.profile_photo ? (
    <img src={profile.profile_photo} alt={profile.display_name} className={`${sz} rounded-full object-cover`} />
  ) : (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white`} style={{ background: profile.cover_color || "#2563eb" }}>
      {profile.display_name?.charAt(0) || "?"}
    </div>
  );
};

// ── Link button ─────────────────────────────────────────────────────────────
const Btn = ({ href, onClick, emoji, label, className = "", style }) => {
  const base = "flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`} style={style} onClick={onClick}><span>{emoji}</span>{label}</a>
  ) : (
    <button onClick={onClick} className={`${base} ${className}`} style={style}><span>{emoji}</span>{label}</button>
  );
};

// ── Profile links ────────────────────────────────────────────────────────────
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
    profile?.location && { emoji: "📍", label: "Address", href: `https://maps.google.com/?q=${encodeURIComponent(profile.location)}`, event: "location_click" },
    profile?.payment_link && { emoji: "💳", label: "Pay / Support", href: profile.payment_link, event: "payment_click" },
  ].filter(Boolean);

  return { primary, secondary };
};

// ── Action buttons (shared) ──────────────────────────────────────────────────
function ActionButtons({ profile, track, color }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  return (
    <div className="space-y-2 w-full">
      <button onClick={() => { track("save_contact_click"); generateVCF(profile); }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{ background: color, color: "#fff" }}>
        💾 Save Contact
      </button>
      <button onClick={() => setInfoOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 border-2"
        style={{ borderColor: color, color }}>
        📋 Request Info
      </button>
      {profile.booking_enabled && (
        <button onClick={() => setBookOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
          style={{ background: color + "22", color }}>
          📅 Book an Appointment
        </button>
      )}
      {infoOpen && <RequestInfoModal profileId={profile.id} onClose={() => setInfoOpen(false)} />}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT: Classic (Modern Card)
// ──────────────────────────────────────────────────────────────────────────────
function LayoutClassic({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4"
      style={{ background: `linear-gradient(160deg, ${color}18 0%, #f1f5f9 60%)` }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ boxShadow: `0 25px 60px -10px ${color}30, 0 10px 30px -5px #0000001a` }}>

          {/* Hero band */}
          <div className="relative h-36" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20" style={{ background: "#fff" }} />
            <div className="absolute top-4 right-8 w-12 h-12 rounded-full opacity-15" style={{ background: "#fff" }} />
            {profile.company_logo && (
              <div className="absolute top-4 left-5">
                <img src={profile.company_logo} className="h-8 object-contain opacity-90" alt="Logo" />
              </div>
            )}
          </div>

          {/* Avatar float */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-14 mb-4">
              <div className="border-4 border-white rounded-full shadow-xl" style={{ boxShadow: `0 8px 24px ${color}40` }}>
                <Avatar profile={profile} />
              </div>
              {profile.plan !== "free" && (
                <span className="mb-2 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: color }}>PRO</span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900">{profile.display_name}</h1>
            {profile.job_title && <p className="font-semibold text-sm mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && (
              <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                🏢 {profile.company_name}
              </p>
            )}
            {profile.bio && <p className="text-slate-500 text-sm mt-3 leading-relaxed border-l-2 pl-3 mt-3" style={{ borderColor: color }}>{profile.bio}</p>}

            {/* Primary CTA buttons */}
            <div className={`grid gap-2 mt-5 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {primary.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.event)}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all active:scale-95 hover:opacity-90"
                  style={{ background: color, color: "#fff" }}>
                  <span className="text-xl">{l.emoji}</span>
                  <span className="text-[11px] font-bold">{l.label}</span>
                </a>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <ActionButtons profile={profile} track={track} color={color} />
              {secondary.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.event)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-sm font-semibold text-slate-700">
                  <span className="text-lg">{l.emoji}</span>{l.label}
                  <svg className="w-4 h-4 ml-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              ))}
            </div>

            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT: Minimal
// ──────────────────────────────────────────────────────────────────────────────
function LayoutMinimal({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen bg-white flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="border-2 rounded-full flex-shrink-0" style={{ borderColor: color }}>
            <Avatar profile={profile} size="sm" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{profile.display_name}</h1>
            {profile.job_title && <p className="text-sm font-medium" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
          </div>
        </div>
        {profile.bio && <p className="text-slate-500 text-sm mb-6 leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>{profile.bio}</p>}
        <div className={`grid gap-2 mb-3 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} style={{ background: color, color: "#fff" }} />)}
        </div>
        <div className="mb-3"><ActionButtons profile={profile} track={track} color={color} /></div>
        <div className="space-y-2">
          {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100" />)}
        </div>
        <PortfolioSection profileId={profile.id} color={color} />
        <p className="text-center text-slate-300 text-xs mt-8">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT: Dark (Glassmorphism)
// ──────────────────────────────────────────────────────────────────────────────
function LayoutDark({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4" style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #0f0f20 100%)" }}>
      <div className="w-full max-w-sm">
        {/* Glow blob */}
        <div className="absolute inset-x-0 top-0 h-64 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}, transparent 70%)` }} />

        <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", boxShadow: `0 25px 60px -10px ${color}30` }}>
          {/* Top banner */}
          <div className="h-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}60, ${color}20)` }}>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-30" style={{ background: color }} />
            {profile.company_logo && <img src={profile.company_logo} className="absolute top-3 left-4 h-7 object-contain opacity-70" alt="Logo" />}
          </div>

          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="border-4 rounded-full" style={{ borderColor: "#0f0f20" }}>
                <Avatar profile={profile} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
            {profile.job_title && <p className="font-semibold text-sm mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-white/40 text-sm">{profile.company_name}</p>}
            {profile.bio && <p className="text-white/50 text-sm mt-3 leading-relaxed">{profile.bio}</p>}

            <div className={`grid gap-2 mt-5 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {primary.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.event)}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all active:scale-95"
                  style={{ background: color, color: "#fff" }}>
                  <span className="text-xl">{l.emoji}</span>
                  <span className="text-[11px] font-bold">{l.label}</span>
                </a>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <ActionButtons profile={profile} track={track} color={color} />
              {secondary.map(l => (
                <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)}
                  className="bg-white/5 text-white border border-white/10 hover:bg-white/10" />
              ))}
            </div>
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-4">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT: Bold (Full bleed gradient)
// ──────────────────────────────────────────────────────────────────────────────
function LayoutBold({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4"
      style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}80 50%, #f8fafc 100%)` }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 pt-4">
          <div className="flex justify-center mb-4">
            <div className="border-4 border-white/40 rounded-full shadow-2xl"><Avatar profile={profile} /></div>
          </div>
          <h1 className="text-3xl font-black text-white drop-shadow">{profile.display_name}</h1>
          {profile.job_title && <p className="text-white/80 font-semibold text-sm mt-1">{profile.job_title}</p>}
          {profile.company_name && <p className="text-white/60 text-sm">{profile.company_name}</p>}
          {profile.bio && <p className="text-white/70 text-sm mt-3 leading-relaxed max-w-xs mx-auto">{profile.bio}</p>}
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-4 border border-white/20 space-y-2">
          <div className={`grid gap-2 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-white text-slate-800 flex-col py-3 gap-0.5 text-xs hover:bg-white/90" />)}
          </div>
          <ActionButtons profile={profile} track={track} color={color} />
          <div className="space-y-2">
            {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-white/15 text-white border border-white/20 hover:bg-white/25" />)}
          </div>
        </div>
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/15">
          <PortfolioSection profileId={profile.id} color="#fff" />
        </div>
        <p className="text-center text-white/40 text-xs mt-4">Powered by <a href="/" className="text-white/70 font-bold">Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT: Split
// ──────────────────────────────────────────────────────────────────────────────
function LayoutSplit({ profile, track }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl flex">
          <div className="w-1.5 flex-shrink-0 rounded-l-3xl" style={{ background: color }} />
          <div className="flex-1 px-5 py-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="border-2 rounded-full flex-shrink-0" style={{ borderColor: color }}><Avatar profile={profile} size="sm" /></div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight">{profile.display_name}</h1>
                {profile.job_title && <p className="text-xs font-bold mt-0.5" style={{ color }}>{profile.job_title}</p>}
                {profile.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
              </div>
            </div>
            {profile.bio && <p className="text-slate-500 text-sm mb-4 leading-relaxed">{profile.bio}</p>}
            <div className={`grid gap-2 mb-2 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} style={{ background: color, color: "#fff" }} className="flex-col py-3 gap-0.5 text-xs" />)}
            </div>
            <div className="mb-2"><ActionButtons profile={profile} track={track} color={color} /></div>
            <div className="space-y-2">
              {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100" />)}
            </div>
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile not found</h2>
        <p className="text-slate-500">This link may be inactive or the username is incorrect.</p>
      </div>
    </div>
  );

  const track = (eventType) => trackEvent(profile.id, eventType);
  const Layout = LAYOUTS[profile.layout || "classic"] || LayoutClassic;

  return <Layout profile={profile} track={track} />;
}