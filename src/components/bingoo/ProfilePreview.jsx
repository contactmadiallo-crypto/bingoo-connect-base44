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
            </div>
          </div>
          <div className="space-y-1.5">
            {links.map(l => <div key={l} className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
            <div className="w-full py-2 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (layout === "neon") return (
    <div className="min-h-screen bg-black p-4">
      <div className="rounded-2xl p-5 text-center border" style={{ borderColor: color, boxShadow: `0 0 24px ${color}44` }}>
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2" style={{ background: color, borderColor: color, boxShadow: `0 0 16px ${color}` }}>
            {profile?.profile_photo
              ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>
            }
          </div>
        </div>
        <h1 className="font-black text-white text-lg" style={{ textShadow: `0 0 12px ${color}` }}>{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        <div className="mt-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 bg-transparent border rounded-xl text-white text-xs font-semibold" style={{ borderColor: `${color}88` }}>{l}</div>)}
          <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-black" style={{ background: color, boxShadow: `0 0 16px ${color}` }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "retro") return (
    <div className="min-h-screen bg-yellow-50 p-4" style={{ fontFamily: "monospace" }}>
      <div className="border-4 border-black rounded-none p-4 bg-white">
        <div className="bg-black text-yellow-300 text-center py-1.5 mb-3 text-xs font-black tracking-widest uppercase">
          {profile?.company_name || "PROFILE"}
        </div>
        <div className="flex justify-center mb-3">
          <div className="border-4 border-black">{avatar}</div>
        </div>
        <h1 className="font-black text-slate-900 text-lg text-center border-b-2 border-black pb-2">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-center text-sm font-bold mt-1" style={{ color }}>{profile.job_title}</p>}
        <div className="mt-3 space-y-1.5">
          {links.map(l => <div key={l} className="w-full py-2 border-2 border-black text-slate-900 text-xs font-black text-center">{l}</div>)}
          <div className="w-full py-2 bg-black text-yellow-300 text-xs font-black text-center">💾 SAVE CONTACT</div>
        </div>
      </div>
    </div>
  );

  if (layout === "magazine") return (
    <div className="min-h-screen bg-white">
      <div className="h-40 relative" style={{ background: profile?.cover_photo ? `url(${profile.cover_photo}) center/cover` : `linear-gradient(135deg, ${color}, ${color}66)` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-black text-white text-xl leading-tight drop-shadow">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-white/80 text-xs font-semibold">{profile.job_title}</p>}
        </div>
      </div>
      <div className="flex gap-3 p-4 border-b border-slate-100">
        <div className="-mt-8 flex-shrink-0">{avatar}</div>
        <div className="flex-1 pt-1">
          {profile?.company_name && <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{profile.company_name}</p>}
          {profile?.bio && <p className="text-slate-600 text-xs leading-relaxed mt-1 line-clamp-2">{profile.bio}</p>}
        </div>
      </div>
      <div className="p-4 space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 border-l-4 text-slate-700 text-xs font-semibold pl-3" style={{ borderColor: color }}>{l}</div>)}
        <div className="w-full py-2.5 text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "aurora") return (
    <div className="min-h-screen p-4" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="h-1 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${color}, #a855f7, #06b6d4)` }} />
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2 border-white/20" style={{ background: color }}>
            {profile?.profile_photo
              ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>
            }
          </div>
        </div>
        <h1 className="font-black text-white text-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-purple-300 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
      </div>
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: `linear-gradient(90deg, ${color}, #a855f7)` }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "minimal_dark") return (
    <div className="min-h-screen bg-zinc-900 p-5">
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
        <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: color }}>
          {profile?.profile_photo
            ? <img src={profile.profile_photo} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <div>
          <h1 className="font-black text-white">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-xs font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
          {profile?.company_name && <p className="text-zinc-500 text-xs">{profile.company_name}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "pastel") return (
    <div className="min-h-screen p-4" style={{ background: "linear-gradient(135deg, #fdf2f8, #eff6ff)" }}>
      <div className="bg-white/80 backdrop-blur rounded-3xl overflow-hidden shadow-lg border border-pink-100">
        <div className="h-28" style={{ background: profile?.cover_photo ? `url(${profile.cover_photo}) center/cover` : `linear-gradient(135deg, ${color}44, #f9a8d455)` }} />
        <div className="px-5 pb-5">
          <div className="flex justify-center -mt-8 mb-3">{avatar}</div>
          <div className="text-center mb-4">
            <h1 className="font-black text-slate-800 text-lg">{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
          </div>
          <div className="space-y-2">
            {links.map(l => <div key={l} className="w-full py-2.5 bg-pink-50 border border-pink-100 rounded-2xl text-slate-600 text-xs font-semibold text-center">{l}</div>)}
            <div className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white text-center" style={{ background: `linear-gradient(135deg, ${color}, #ec4899)` }}>💾 Save Contact</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (layout === "corporate") return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-xl overflow-hidden shadow border border-slate-200">
        <div className="h-2" style={{ background: color }} />
        <div className="p-4 flex items-center gap-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
            {profile?.profile_photo
              ? <img src={profile.profile_photo} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white" style={{ background: color }}>{profile?.display_name?.charAt(0) || "?"}</div>
            }
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base">{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-xs font-bold mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
          </div>
        </div>
        <div className="p-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold text-center">{l}</div>)}
          <div className="w-full py-2 rounded-lg text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "floating") return (
    <div className="min-h-screen p-6" style={{ background: `radial-gradient(circle at 50% 0%, ${color}22, #f1f5f9 60%)` }}>
      <div className="bg-white rounded-3xl shadow-xl p-5 mb-3 text-center border border-slate-100">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-slate-900 text-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2 border border-slate-100">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  // classic (default) — fixed cover display with proper height
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Cover — proper full-width horizontal banner */}
        <div
          className="w-full"
          style={{
            height: "140px",
            backgroundImage: profile?.cover_photo ? `url(${profile.cover_photo})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            background: profile?.cover_photo ? undefined : `linear-gradient(135deg, ${color}, ${color}99)`,
          }}
        >
          {profile?.cover_photo && (
            <div className="w-full h-full" style={{ backgroundImage: `url(${profile.cover_photo})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
        </div>
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