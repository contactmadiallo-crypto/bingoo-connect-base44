import { useParams } from "react-router-dom";
import { useState } from "react";
import RequestInfoModal from "@/components/bingoo/RequestInfoModal";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

// ── analytics ──────────────────────────────────────────────────────────────
const trackEvent = (profileId, eventType) => {
  base44.entities.Analytics.create({
    profile_id: profileId,
    event_type: eventType,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
};

// ── vcf download ────────────────────────────────────────────────────────────
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
  a.href = url;
  a.download = `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── shared helpers ─────────────────────────────────────────────────────────
const Avatar = ({ profile, size = "lg" }) => {
  const sz = size === "lg" ? "w-24 h-24 text-4xl" : "w-16 h-16 text-2xl";
  return profile.profile_photo ? (
    <img src={profile.profile_photo} alt={profile.display_name} className={`${sz} rounded-full object-cover`} />
  ) : (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white`} style={{ background: profile.cover_color || "#2563eb" }}>
      {profile.display_name?.charAt(0) || "?"}
    </div>
  );
};

const Btn = ({ href, onClick, emoji, label, className = "" }) => {
  const base = "flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-sm";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`} onClick={onClick}><span>{emoji}</span>{label}</a>
  ) : (
    <button onClick={onClick} className={`${base} ${className}`}><span>{emoji}</span>{label}</button>
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
    profile?.location && { emoji: "📍", label: "Location", href: `https://maps.google.com/?q=${encodeURIComponent(profile.location)}`, event: "location_click" },
    profile?.payment_link && { emoji: "💳", label: "Pay / Support", href: profile.payment_link, event: "payment_click" },
  ].filter(Boolean);

  return { primary, secondary };
};

// ── LAYOUT: Classic ─────────────────────────────────────────────────────────
function LayoutClassic({ profile, track, requestInfoBtn }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="h-32" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }} />
          <div className="px-5 pb-6">
            <div className="flex justify-center -mt-12 mb-3">
              <div className="border-4 border-white rounded-full shadow-lg"><Avatar profile={profile} /></div>
            </div>
            <div className="text-center mb-5">
              <h1 className="text-2xl font-black text-slate-900">{profile.display_name}</h1>
              {profile.job_title && <p className="font-semibold text-sm mt-0.5" style={{ color }}>{profile.job_title}</p>}
              {profile.company_name && <p className="text-slate-500 text-sm">{profile.company_name}</p>}
              {profile.bio && <p className="text-slate-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
            </div>
            <div className={`grid gap-2 mb-3 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-800 text-white flex-col py-3 gap-0.5 text-xs" />)}
            </div>
            <Btn onClick={() => { track("save_contact_click"); generateVCF(profile); }} emoji="💾" label="Save Contact" className="bg-blue-50 text-blue-700 border border-blue-100 mb-3 hover:bg-blue-100" />
            {requestInfoBtn && <div className="mb-3">{requestInfoBtn}</div>}
            <div className="space-y-2">
              {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-50 text-slate-800 border border-slate-100 hover:bg-slate-100" />)}
            </div>
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">Powered by <a href="/" className="text-blue-600 font-bold">Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── LAYOUT: Minimal ─────────────────────────────────────────────────────────
function LayoutMinimal({ profile, track, requestInfoBtn }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen bg-white flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="border-2 rounded-full flex-shrink-0" style={{ borderColor: color }}><Avatar profile={profile} size="sm" /></div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{profile.display_name}</h1>
            {profile.job_title && <p className="text-sm font-medium" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
          </div>
        </div>
        {profile.bio && <p className="text-slate-500 text-sm mb-6 leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>{profile.bio}</p>}
        <div className={`grid gap-2 mb-3 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="text-white flex-col py-3 gap-0.5 text-xs" style={{ background: color }} />)}
        </div>
        <Btn onClick={() => { track("save_contact_click"); generateVCF(profile); }} emoji="💾" label="Save Contact" className="border mb-3" style={{ borderColor: color, color }} />
        {requestInfoBtn && <div className="mb-3">{requestInfoBtn}</div>}
        <div className="space-y-2">
          {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100" />)}
        </div>
        <p className="text-center text-slate-300 text-xs mt-8">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── LAYOUT: Dark ─────────────────────────────────────────────────────────────
function LayoutDark({ profile, track, requestInfoBtn }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <div className="px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="border-4 border-slate-700 rounded-full shadow-2xl"><Avatar profile={profile} /></div>
            </div>
            <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
            {profile.job_title && <p className="font-semibold text-sm mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile.company_name && <p className="text-slate-400 text-sm">{profile.company_name}</p>}
            {profile.bio && <p className="text-slate-400 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
          </div>
          <div className="px-5 pb-6 space-y-3">
            <div className={`grid gap-2 ${primary.length === 1 ? "grid-cols-1" : primary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="text-white flex-col py-3 gap-0.5 text-xs rounded-2xl" style={{ background: color }} />)}
            </div>
            <Btn onClick={() => { track("save_contact_click"); generateVCF(profile); }} emoji="💾" label="Save Contact" className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700" />
            {requestInfoBtn && <div>{requestInfoBtn}</div>}
            <div className="space-y-2">
              {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700" />)}
            </div>
          </div>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── LAYOUT: Bold ─────────────────────────────────────────────────────────────
function LayoutBold({ profile, track, requestInfoBtn }) {
  const { primary, secondary } = useProfileLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4" style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}99 60%, #f8fafc 100%)` }}>
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
          <Btn onClick={() => { track("save_contact_click"); generateVCF(profile); }} emoji="💾" label="Save Contact" className="bg-white/20 text-white border border-white/30 hover:bg-white/30" />
          {requestInfoBtn && <div>{requestInfoBtn}</div>}
          <div className="space-y-2">
            {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-white/15 text-white border border-white/20 hover:bg-white/25" />)}
          </div>
        </div>
        <p className="text-center text-white/40 text-xs mt-4">Powered by <a href="/" className="text-white/70 font-bold">Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── LAYOUT: Split ─────────────────────────────────────────────────────────────
function LayoutSplit({ profile, track, requestInfoBtn }) {
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
              {primary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="text-white flex-col py-3 gap-0.5 text-xs" style={{ background: color }} />)}
            </div>
            <Btn onClick={() => { track("save_contact_click"); generateVCF(profile); }} emoji="💾" label="Save Contact" className="border mb-2 hover:bg-slate-50" style={{ borderColor: color, color }} />
            {requestInfoBtn && <div className="mb-2">{requestInfoBtn}</div>}
            <div className="space-y-2">
              {secondary.map(l => <Btn key={l.label} href={l.href} emoji={l.emoji} label={l.label} onClick={() => track(l.event)} className="bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100" />)}
            </div>
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">Powered by <a href="/" className="font-bold" style={{ color }}>Bingoo Connect</a></p>
      </div>
    </div>
  );
}

// ── Request Info button ─────────────────────────────────────────────────────
function RequestInfoBtn({ profileId, color }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-sm border-2" style={{ borderColor: color, color }}>
        📋 Request Info
      </button>
      {open && <RequestInfoModal profileId={profileId} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Book Appointment button ──────────────────────────────────────────────────
function BookAppointmentBtn({ profile, color }) {
  const [open, setOpen] = useState(false);
  if (!profile.booking_enabled) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-sm" style={{ background: color, color: "#fff" }}>
        📅 Book an Appointment
      </button>
      {open && <AppointmentBooking profile={profile} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Main public profile page ──────────────────────────────────────────────────
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

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

  const color = profile.cover_color || "#2563eb";
  const infoBtn = (
    <div className="space-y-2">
      <RequestInfoBtn profileId={profile.id} color={color} />
      <BookAppointmentBtn profile={profile} color={color} />
    </div>
  );
  return <Layout profile={profile} track={track} requestInfoBtn={infoBtn} />;
}