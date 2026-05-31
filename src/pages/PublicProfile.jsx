import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
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

  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.display_name?.replace(/\s+/g, "_") || "contact"}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};

function ActionButton({ href, onClick, emoji, label, className = "" }) {
  const base = "flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 shadow-sm";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`} onClick={onClick}>
        <span className="text-xl">{emoji}</span> {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${className}`}>
      <span className="text-xl">{emoji}</span> {label}
    </button>
  );
}

export default function PublicProfile() {
  const { username } = useParams();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => base44.entities.Profile.filter({ username }),
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id) {
      trackEvent(profile.id, "profile_view");
    }
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile not found</h2>
          <p className="text-slate-500">This link may be inactive or the username is incorrect.</p>
        </div>
      </div>
    );
  }

  const track = (eventType) => trackEvent(profile.id, eventType);

  const socialLinks = [
    { key: "whatsapp", emoji: "💬", label: "WhatsApp", href: `https://wa.me/${profile.whatsapp_number?.replace(/\D/g, "")}`, event: "whatsapp_click", primary: true },
    { key: "phone", emoji: "📞", label: "Call Now", href: `tel:${profile.phone}`, event: "phone_click", primary: true },
    { key: "email", emoji: "📧", label: "Send Email", href: `mailto:${profile.email}`, event: "email_click", primary: true },
  ].filter(l => profile[l.key === "phone" ? "phone" : l.key === "email" ? "email" : "whatsapp_number"]);

  const secondaryLinks = [
    profile.instagram_url && { emoji: "📸", label: "Instagram", href: profile.instagram_url, event: "instagram_click" },
    profile.facebook_url && { emoji: "👤", label: "Facebook", href: profile.facebook_url, event: "facebook_click" },
    profile.tiktok_url && { emoji: "🎵", label: "TikTok", href: profile.tiktok_url, event: "tiktok_click" },
    profile.linkedin_url && { emoji: "💼", label: "LinkedIn", href: profile.linkedin_url, event: "linkedin_click" },
    profile.youtube_url && { emoji: "▶️", label: "YouTube", href: profile.youtube_url, event: "youtube_click" },
    profile.website && { emoji: "🌐", label: "Website", href: profile.website, event: "website_click" },
    profile.location && { emoji: "📍", label: "Location", href: `https://maps.google.com/?q=${encodeURIComponent(profile.location)}`, event: "location_click" },
    profile.payment_link && { emoji: "💳", label: "Pay / Support", href: profile.payment_link, event: "payment_click" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-sm mx-auto">
        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          {/* Cover */}
          <div
            className="h-36 relative"
            style={{ background: `linear-gradient(135deg, ${profile.cover_color || "#2563eb"}, ${profile.cover_color || "#2563eb"}bb)` }}
          />

          {/* Avatar */}
          <div className="flex justify-center -mt-14 px-6">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.display_name}
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-5xl font-black text-white"
                style={{ background: profile.cover_color || "#2563eb" }}
              >
                {profile.display_name?.charAt(0) || "?"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-6 pt-3 pb-6">
            <div className="text-center mb-5">
              <h1 className="text-2xl font-black text-slate-900">{profile.display_name}</h1>
              {profile.job_title && <p className="text-blue-600 font-semibold text-sm mt-0.5">{profile.job_title}</p>}
              {profile.company_name && <p className="text-slate-500 text-sm">{profile.company_name}</p>}
              {profile.bio && <p className="text-slate-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
            </div>

            {/* Primary actions */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {profile.whatsapp_number && (
                <ActionButton
                  href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}`}
                  emoji="💬"
                  label="WhatsApp"
                  onClick={() => track("whatsapp_click")}
                  className="bg-green-500 hover:bg-green-600 text-white flex-col gap-0 py-3"
                />
              )}
              {profile.phone && (
                <ActionButton
                  href={`tel:${profile.phone}`}
                  emoji="📞"
                  label="Call"
                  onClick={() => track("phone_click")}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-col gap-0 py-3"
                />
              )}
              {profile.email && (
                <ActionButton
                  href={`mailto:${profile.email}`}
                  emoji="📧"
                  label="Email"
                  onClick={() => track("email_click")}
                  className="bg-slate-700 hover:bg-slate-800 text-white flex-col gap-0 py-3"
                />
              )}
            </div>

            {/* Save Contact */}
            <button
              onClick={() => { track("save_contact_click"); generateVCF(profile); }}
              className="w-full py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-base transition-all active:scale-95 border border-blue-100 flex items-center justify-center gap-2 mb-4"
            >
              <span className="text-xl">💾</span> Save Contact
            </button>

            {/* Secondary links */}
            {secondaryLinks.length > 0 && (
              <div className="space-y-2.5">
                {secondaryLinks.map(link => (
                  <ActionButton
                    key={link.label}
                    href={link.href}
                    emoji={link.emoji}
                    label={link.label}
                    onClick={() => track(link.event)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-5">
          Powered by{" "}
          <a href="/" className="text-blue-600 font-bold hover:underline">Bingoo Connect</a>
        </p>
      </div>
    </div>
  );
}