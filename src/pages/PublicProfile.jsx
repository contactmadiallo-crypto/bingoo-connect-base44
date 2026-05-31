import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

const typeIcons = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  twitter: "🐦",
  linkedin: "💼",
  website: "🌐",
  whatsapp: "💬",
  email: "📧",
  phone: "📞",
  other: "🔗",
};

export default function PublicProfile() {
  const { username } = useParams();

  const { data: profiles = [] } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => base44.entities.Profile.filter({ username }),
  });

  const profile = profiles[0];

  const { data: links = [] } = useQuery({
    queryKey: ["public-links", profile?.id],
    queryFn: () => base44.entities.Link.filter({ profile_id: profile.id, is_active: true }),
    enabled: !!profile?.id,
  });

  const recordTap = useMutation({
    mutationFn: () => base44.entities.TapEvent.create({
      profile_id: profile.id,
      event_type: "tap",
      tapped_at: new Date().toISOString(),
    }),
  });

  const recordClick = useMutation({
    mutationFn: ({ link, eventType }) => {
      base44.entities.TapEvent.create({
        profile_id: profile.id,
        link_id: link.id,
        event_type: eventType,
        tapped_at: new Date().toISOString(),
      });
      base44.entities.Link.update(link.id, { click_count: (link.click_count || 0) + 1 });
    },
  });

  useEffect(() => {
    if (profile?.id) {
      recordTap.mutate();
    }
  }, [profile?.id]);

  const handleLinkClick = (link) => {
    const eventType =
      link.type === "whatsapp" ? "whatsapp_click" :
      link.type === "email" ? "email_click" :
      link.type === "phone" ? "phone_click" : "link_click";
    recordClick.mutate({ link, eventType });
    window.open(link.url, "_blank");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile not found</h2>
          <p className="text-slate-500">This link may be inactive or misspelled.</p>
        </div>
      </div>
    );
  }

  const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Cover */}
          <div
            className="h-32"
            style={{ background: `linear-gradient(135deg, ${profile.cover_color || "#6366f1"}, ${profile.cover_color || "#6366f1"}99)` }}
          />
          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex justify-center -mt-12 mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl"
                  style={{ background: profile.cover_color || "#6366f1" }}
                >
                  {profile.display_name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 text-center">{profile.display_name}</h1>
            {profile.bio && (
              <p className="text-slate-500 text-sm text-center mt-1 mb-4">{profile.bio}</p>
            )}

            {/* Quick contact buttons */}
            <div className="flex gap-2 justify-center mb-5">
              {profile.whatsapp && (
                <button
                  onClick={() => {
                    recordClick.mutate({ link: { id: "whatsapp", type: "whatsapp", click_count: 0 }, eventType: "whatsapp_click" });
                    window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`, "_blank");
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
                >
                  💬 WhatsApp
                </button>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex-1">
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 text-sm font-semibold transition-colors">
                    📞 Call
                  </button>
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex-1">
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 text-sm font-semibold transition-colors">
                    📧 Email
                  </button>
                </a>
              )}
            </div>

            {/* Links */}
            {sortedLinks.length > 0 && (
              <div className="space-y-3">
                {sortedLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link)}
                    className="w-full flex items-center gap-3 bg-slate-50 hover:bg-slate-100 rounded-2xl px-4 py-3 transition-all text-left group"
                  >
                    <span className="text-2xl">{link.icon || typeIcons[link.type] || "🔗"}</span>
                    <span className="font-semibold text-slate-800 flex-1">{link.title}</span>
                    <span className="text-slate-400 text-xs group-hover:text-slate-600">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bingoo branding */}
        <div className="text-center mt-4">
          <p className="text-slate-400 text-xs">Powered by <span className="font-bold text-indigo-600">Bingoo Africa</span></p>
        </div>
      </div>
    </div>
  );
}