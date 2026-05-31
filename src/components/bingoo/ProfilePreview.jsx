// Compact inline preview — mirrors public profile layouts
export default function ProfilePreview({ profile }) {
  const color = profile?.cover_color || "#2563eb";
  const layout = profile?.layout || "classic";

  const avatar = profile?.profile_photo
    ? <img src={profile.profile_photo} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" alt="" />
    : <div className="w-16 h-16 rounded-full border-4 border-white shadow flex items-center justify-center text-2xl font-black text-white" style={{ background: color }}>{profile?.display_name?.charAt(0) || "?"}</div>;

  const links = [
    profile?.whatsapp_number && "💬 WhatsApp",
    profile?.phone && "📞 Call",
    profile?.email && "📧 Email",
    profile?.instagram_url && "📸 Instagram",
    profile?.facebook_url && "👤 Facebook",
    profile?.website && "🌐 Website",
  ].filter(Boolean);

  if (layout === "dark") return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="bg-slate-800 rounded-2xl p-5 text-center">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-white text-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
        {profile?.bio && <p className="text-slate-400 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
        <div className="mt-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-700 rounded-xl text-slate-200 text-xs font-semibold">{l}</div>)}
          <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: color }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "minimal") return (
    <div className="min-h-screen bg-white p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="border-2 rounded-full flex-shrink-0" style={{ borderColor: color }}>{avatar}</div>
        <div>
          <h1 className="font-black text-slate-900">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-sm font-semibold" style={{ color }}>{profile.job_title}</p>}
          {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
        </div>
      </div>
      {profile?.bio && <p className="text-slate-500 text-xs mb-4 leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>{profile.bio}</p>}
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "bold") return (
    <div className="min-h-screen p-4" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-white text-xl drop-shadow">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-white/80 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
        {profile?.company_name && <p className="text-white/60 text-xs">{profile.company_name}</p>}
        {profile?.bio && <p className="text-white/70 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 space-y-2 border border-white/20">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/20 text-white rounded-xl text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 bg-white text-slate-800 rounded-xl text-xs font-semibold text-center">💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "split") return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden flex border border-slate-100">
        <div className="w-1.5 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">{avatar}</div>
            <div>
              <h1 className="font-black text-slate-900">{profile?.display_name || "Your Name"}</h1>
              {profile?.job_title && <p className="text-xs font-bold" style={{ color }}>{profile.job_title}</p>}
              {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
            </div>
          </div>
          {profile?.bio && <p className="text-slate-500 text-xs mb-3 leading-relaxed">{profile.bio}</p>}
          <div className="space-y-1.5">
            {links.map(l => <div key={l} className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
            <div className="w-full py-2 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
          </div>
        </div>
      </div>
    </div>
  );

  // classic (default)
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        {profile?.cover_photo
          ? <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${profile.cover_photo})` }} />
          : <div className="h-24" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }} />
        }
        <div className="px-4 pb-5">
          <div className="flex justify-center -mt-8 mb-2">{avatar}</div>
          <div className="text-center mb-4">
            <h1 className="font-black text-slate-900 text-lg">{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
            {profile?.bio && <p className="text-slate-600 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
          </div>
          <div className="space-y-2">
            {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
            <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
          </div>
        </div>
      </div>
    </div>
  );
}