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

  if (layout === "glass_3d") return (
    <div className="min-h-screen p-4" style={{ background: `linear-gradient(135deg, ${color}22 0%, #e0e7ff 50%, #f8fafc 100%)` }}>
      <div className="rounded-3xl p-5 mb-3 text-center" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.8)" }}>
        <div className="flex justify-center mb-3">
          <div style={{ filter: `drop-shadow(0 8px 24px ${color}55)` }}>{avatar}</div>
        </div>
        <h1 className="font-black text-slate-900 text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-slate-600 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="rounded-2xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.7)" }}>
        {links.map(l => <div key={l} className="w-full py-2.5 rounded-xl text-slate-700 text-xs font-semibold text-center transition-all" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 16px ${color}44` }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "luxury_gold") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #1a0a00, #2d1a00, #1a0a00)" }}>
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #FFD700, #D4AF37, transparent)" }} />
      <div className="px-5 py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, #FFD700, #B8860B)`, boxShadow: "0 4px 24px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-amber-900">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-amber-100 text-2xl tracking-wide">{profile?.display_name || "Your Name"}</h1>
        <div className="w-16 h-px mx-auto my-2" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
        {profile?.job_title && <p className="text-sm font-semibold" style={{ color: "#D4AF37" }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-amber-200/60 text-xs mt-3 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="px-5 pb-8 space-y-2">
        {links.map(l => <div key={l} className="w-full py-3 rounded-lg text-amber-200 text-xs font-semibold text-center" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>{l}</div>)}
        <div className="w-full py-3 rounded-lg text-xs font-black text-black text-center" style={{ background: "linear-gradient(90deg, #B8860B, #FFD700, #B8860B)", boxShadow: "0 4px 16px rgba(212,175,55,0.4)" }}>💾 Save Contact</div>
      </div>
      <div className="h-px mx-8" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
    </div>
  );

  if (layout === "executive_corp") return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex items-stretch" style={{ minHeight: "180px" }}>
        <div className="w-1.5 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 bg-slate-900 flex flex-col justify-center px-5 py-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>{profile?.company_name || "COMPANY"}</p>
          <h1 className="font-black text-white text-2xl leading-tight">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-slate-400 text-sm mt-1">{profile.job_title}</p>}
        </div>
        <div className="w-20 flex-shrink-0 bg-slate-800 flex items-center justify-center">
          {profile?.profile_photo ? <img src={profile.profile_photo} className="w-16 h-16 rounded-full object-cover" alt="" /> : <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>{profile?.display_name?.charAt(0) || "?"}</div>}
        </div>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="px-5 py-5 space-y-2">
        {profile?.bio && <p className="text-slate-400 text-xs leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: color }}>{profile.bio}</p>}
        {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-800/60 border border-slate-700 rounded text-slate-300 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded text-xs font-bold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "neon_tech") return (
    <div className="min-h-screen p-4" style={{ background: "#050510" }}>
      <div className="pb-4 mb-4" style={{ borderBottom: `1px solid ${color}44` }}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded flex-shrink-0" style={{ background: `${color}22`, border: `1px solid ${color}`, boxShadow: `0 0 20px ${color}55` }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ color }}>{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
          <div>
            <h1 className="font-black text-white text-lg" style={{ textShadow: `0 0 20px ${color}88` }}>{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-xs font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
            {profile?.company_name && <p className="text-cyan-500/60 text-xs">{profile.company_name}</p>}
          </div>
        </div>
      </div>
      {profile?.bio && <p className="text-slate-400 text-xs leading-relaxed mb-4" style={{ borderLeft: `2px solid ${color}`, paddingLeft: "12px" }}>{profile.bio}</p>}
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded text-xs font-semibold text-white text-center" style={{ background: `${color}11`, border: `1px solid ${color}44`, boxShadow: `inset 0 0 8px ${color}11` }}>{l}</div>)}
        <div className="w-full py-2.5 rounded text-xs font-black text-black text-center" style={{ background: `linear-gradient(90deg, ${color}, #06b6d4)`, boxShadow: `0 0 20px ${color}66` }}>💾 Save Contact</div>
      </div>
      <div className="mt-4 flex justify-center gap-1">
        {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full" style={{ background: i === 1 ? color : `${color}44` }} />)}
      </div>
    </div>
  );

  if (layout === "modern_law") return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-stretch bg-slate-900" style={{ minHeight: "160px" }}>
        <div className="w-1.5 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 flex flex-col justify-center px-5 py-6">
          <h1 className="font-black text-white text-xl leading-tight">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-sm font-semibold mt-1" style={{ color }}>{profile.job_title}</p>}
          {profile?.company_name && <p className="text-slate-400 text-xs mt-0.5 uppercase tracking-wider">{profile.company_name}</p>}
        </div>
        <div className="w-24 bg-slate-800 flex items-center justify-center">
          {profile?.profile_photo ? <img src={profile.profile_photo} className="w-16 h-16 rounded object-cover" alt="" /> : <div className="w-16 h-16 rounded flex items-center justify-center text-xl font-black text-white" style={{ background: `${color}44` }}>{profile?.display_name?.charAt(0) || "?"}</div>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-2">
        {profile?.bio && <p className="text-slate-600 text-xs leading-relaxed mb-4">{profile.bio}</p>}
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white border-l-4 border-slate-200 text-slate-700 text-xs font-semibold pl-3 rounded-r-lg flex items-center gap-2" style={{}}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />{l}</div>)}
        <div className="w-full py-2.5 text-xs font-bold text-white text-center rounded" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "premium_salon") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #1a0a14, #2d1020, #1a0a14)" }}>
      <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, #f9a8d4, ${color}, #f9a8d4, transparent)` }} />
      <div className="px-5 py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, #f9a8d4, ${color})`, boxShadow: `0 4px 24px ${color}66` }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-pink-100 text-xl tracking-wide">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5 text-pink-300">{profile.job_title}</p>}
        {profile?.bio && <p className="text-pink-200/50 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="px-5 pb-8 space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded-2xl text-pink-200 text-xs font-semibold text-center" style={{ background: "rgba(249,168,212,0.1)", border: "1px solid rgba(249,168,212,0.2)" }}>{l}</div>)}
        <div className="w-full py-2.5 rounded-2xl text-xs font-bold text-white text-center" style={{ background: `linear-gradient(135deg, ${color}, #f9a8d4)`, boxShadow: `0 4px 16px ${color}44` }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "realtor_luxury") return (
    <div className="min-h-screen bg-white">
      <div className="relative" style={{ height: "200px", background: "linear-gradient(160deg, #0f2027, #203a43, #2c5364)" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
        <div className="absolute top-4 right-4">
          <div className="w-8 h-1 rounded" style={{ background: color }} />
          <div className="w-5 h-0.5 mt-0.5 rounded ml-auto" style={{ background: `${color}88` }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ borderRadius: "24px 24px 0 0" }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="w-16 h-16 rounded-full border-4 border-white" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full rounded-full flex items-center justify-center text-xl font-black text-white" style={{ background: `linear-gradient(135deg, ${color}, #2c5364)` }}>{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
      </div>
      <div className="px-5 pt-2 pb-6 text-center">
        <h1 className="font-black text-slate-900 text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.company_name && <p className="text-slate-400 text-xs mt-0.5 uppercase tracking-wider">{profile.company_name}</p>}
        {profile?.bio && <p className="text-slate-500 text-xs mt-3 leading-relaxed">{profile.bio}</p>}
        <div className="mt-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold">{l}</div>)}
          <div className="w-full py-2.5 rounded-lg text-xs font-bold text-white text-center" style={{ background: `linear-gradient(135deg, ${color}, #2c5364)` }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "animated_gradient") return (
    <div className="min-h-screen p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}, #a855f7, #06b6d4, ${color})`, backgroundSize: "300% 300%", animation: "gradientShift 6s ease infinite" }}>
      <style>{`@keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
      <div className="text-center py-4 relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-white/40" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black text-white bg-white/20">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-white text-2xl drop-shadow-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-white/80 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
        {profile?.bio && <p className="text-white/70 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="rounded-2xl p-3 space-y-2 relative z-10" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/20 rounded-xl text-white text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 bg-white rounded-xl text-xs font-bold text-slate-800 text-center">💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "video_bg") return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(135deg, #0f0f0f, #1a1a2e)" }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)", backgroundSize: "8px 8px" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mb-4 cursor-pointer" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}>
          <div className="w-0 h-0 ml-1" style={{ borderLeft: `16px solid rgba(255,255,255,0.8)`, borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
        </div>
        <p className="text-white/50 text-xs">Video Background</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: color }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
          <div>
            <h1 className="font-black text-white text-base">{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-white/60 text-xs">{profile.job_title}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          {links.slice(0,3).map(l => <div key={l} className="w-full py-2 rounded-lg text-white text-xs font-semibold text-center" style={{ background: `${color}44`, border: `1px solid ${color}66` }}>{l}</div>)}
          <div className="w-full py-2 rounded-lg text-xs font-bold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "parallax") return (
    <div className="min-h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      <div className="relative overflow-hidden" style={{ height: "220px" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${color}44, ${color}11)`, transform: "scale(1.1)" }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 100%, ${color}66 0%, transparent 70%)` }} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
          <div className="w-20 h-20 rounded-full border-4 border-white/20" style={{ background: color, boxShadow: `0 8px 32px ${color}66` }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
      </div>
      <div className="px-5 py-5 text-center">
        <h1 className="font-black text-white text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-white/50 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
        <div className="mt-5 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 rounded-xl text-white text-xs font-semibold text-center" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44` }}>{l}</div>)}
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 4px 20px ${color}44` }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "glassmorphic") return (
    <div className="min-h-screen p-4" style={{ background: `linear-gradient(135deg, ${color}44, #e0e7ff)` }}>
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/60 shadow-xl">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-slate-900 text-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-slate-600 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
        <div className="mt-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 bg-white/50 border border-white/70 rounded-xl text-slate-700 text-xs font-semibold">{l}</div>)}
          <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: color }}>💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "gradient") return (
    <div className="min-h-screen p-4" style={{ background: `linear-gradient(135deg, ${color}22, ${color}88)` }}>
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-slate-900 text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-slate-700 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="space-y-2 mt-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/60 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "sunset") return (
    <div className="min-h-screen p-4" style={{ background: "linear-gradient(160deg,#ff6b35,#f7c59f,#ffe0cc)" }}>
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-white text-xl drop-shadow">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-white/80 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
        {profile?.bio && <p className="text-white/70 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="bg-white/25 rounded-2xl p-3 space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/40 rounded-xl text-white text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 bg-white rounded-xl text-xs font-semibold text-orange-600 text-center">💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "ocean") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0077b6,#00b4d8,#90e0ef)" }}>
      <div className="h-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 5px)" }} />
      </div>
      <div className="px-4 pb-6 text-center -mt-8">
        <div className="flex justify-center mb-3">{avatar}</div>
        <h1 className="font-black text-white text-xl drop-shadow">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-white/80 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
        <div className="mt-4 space-y-2">
          {links.map(l => <div key={l} className="w-full py-2.5 bg-white/20 border border-white/30 rounded-xl text-white text-xs font-semibold">{l}</div>)}
          <div className="w-full py-2.5 bg-white rounded-xl text-xs font-semibold text-blue-700 text-center">💾 Save Contact</div>
        </div>
      </div>
    </div>
  );

  if (layout === "forest") return (
    <div className="min-h-screen bg-emerald-950 p-4">
      <div className="h-10 rounded-xl mb-4" style={{ background: "linear-gradient(90deg,#16a34a88,#14532d88)" }} />
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-400/50" style={{ background: color }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-emerald-100 text-lg">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-emerald-400 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
      </div>
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-emerald-900/80 border border-emerald-700/40 rounded-xl text-emerald-200 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: "#16a34a" }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "luxury") return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="text-center py-4 border-b border-amber-600/30 mb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border border-amber-500/70" style={{ background: color }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-amber-100 text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-amber-500 text-sm font-semibold mt-0.5">{profile.job_title}</p>}
        {profile?.bio && <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 bg-amber-900/20 border border-amber-700/30 rounded-lg text-amber-200 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-lg text-xs font-semibold text-black text-center" style={{ background: "linear-gradient(90deg,#b45309,#fbbf24)" }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "bubbly") return (
    <div className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20" style={{ background: color }} />
      <div className="absolute bottom-10 left-2 w-12 h-12 rounded-full opacity-15" style={{ background: "#f472b6" }} />
      <div className="text-center py-4 relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, #f472b6)` }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-slate-900 text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="space-y-2 relative z-10">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded-2xl text-xs font-semibold text-center" style={{ background: `${color}18` }}>{l}</div>)}
        <div className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white text-center" style={{ background: `linear-gradient(135deg,${color},#f472b6)` }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "monochrome") return (
    <div className="min-h-screen bg-white border-2 border-black">
      <div className="bg-black p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex-shrink-0">
          {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg font-black text-black">{profile?.display_name?.charAt(0) || "?"}</div>}
        </div>
        <div>
          <h1 className="font-black text-white text-base">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-gray-400 text-xs">{profile.job_title}</p>}
        </div>
      </div>
      <div className="p-4 space-y-2">
        {profile?.bio && <p className="text-slate-600 text-xs border-l-2 border-black pl-2 mb-3">{profile.bio}</p>}
        {links.map(l => <div key={l} className="w-full py-2.5 border-2 border-black rounded text-slate-900 text-xs font-black text-center">{l}</div>)}
        <div className="w-full py-2.5 bg-black text-white rounded text-xs font-black text-center">💾 SAVE CONTACT</div>
      </div>
    </div>
  );

  if (layout === "cyberpunk") return (
    <div className="min-h-screen p-4" style={{ background: "#0a001f" }}>
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded" style={{ background: color, boxShadow: `0 0 20px ${color}` }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-white text-xl" style={{ textShadow: `0 0 12px ${color}` }}>{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color }}>{profile.job_title}</p>}
      </div>
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded border text-white text-xs font-semibold text-center" style={{ borderColor: `${color}88`, background: `${color}11` }}>{l}</div>)}
        <div className="w-full py-2.5 rounded text-xs font-semibold text-black text-center" style={{ background: color, boxShadow: `0 0 16px ${color}` }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "frosted") return (
    <div className="min-h-screen p-4" style={{ background: `linear-gradient(135deg,${color}44,${color}22,#e0e7ff88)` }}>
      <div className="rounded-3xl p-5 mb-3" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">{avatar}</div>
          <div>
            <h1 className="font-black text-slate-900 text-base">{profile?.display_name || "Your Name"}</h1>
            {profile?.job_title && <p className="text-xs font-semibold" style={{ color }}>{profile.job_title}</p>}
          </div>
        </div>
        {profile?.bio && <p className="text-slate-600 text-xs leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="rounded-2xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)" }}>
        {links.map(l => <div key={l} className="w-full py-2.5 bg-white/50 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "paper") return (
    <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: "Georgia, serif" }}>
      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-end justify-between">
        <div>
          <h1 className="font-black text-slate-900 text-xl leading-tight">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-slate-500 text-sm mt-0.5">{profile.job_title}</p>}
          {profile?.company_name && <p className="text-slate-400 text-xs">{profile.company_name}</p>}
        </div>
        <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: color }}>
          {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
        </div>
      </div>
      {profile?.bio && <p className="text-slate-600 text-xs leading-relaxed mb-4">{profile.bio}</p>}
      <div className="space-y-2">
        {links.map(l => <div key={l} className="w-full py-2.5 border border-slate-200 bg-white rounded text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "wave") return (
    <div className="min-h-screen bg-white">
      <div className="relative" style={{ background: `linear-gradient(135deg,${color},${color}88)`, paddingBottom: "2rem" }}>
        <div className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-2">{avatar}</div>
          <h1 className="font-black text-white text-xl drop-shadow">{profile?.display_name || "Your Name"}</h1>
          {profile?.job_title && <p className="text-white/80 text-sm font-semibold">{profile.job_title}</p>}
        </div>
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute bottom-0 w-full h-8">
          <path d="M0,10 C20,20 40,0 60,10 C80,20 100,5 100,10 L100,20 L0,20 Z" fill="white" />
        </svg>
      </div>
      <div className="px-4 pt-2 pb-6 space-y-2">
        {profile?.bio && <p className="text-slate-500 text-xs leading-relaxed mb-3">{profile.bio}</p>}
        {links.map(l => <div key={l} className="w-full py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold text-center">{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: color }}>💾 Save Contact</div>
      </div>
    </div>
  );

  if (layout === "ny_championship") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#020818,#0B2E6B)" }}>
      <div className="h-1" style={{ background: "linear-gradient(90deg,#FF7A00,#FDBA21,#FF7A00)" }} />
      <div className="px-4 py-6 text-center">
        <div className="text-3xl mb-2">🏀</div>
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2" style={{ borderColor: "#FF7A00", background: color }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-white text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color: "#FF7A00" }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-white/60 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="px-4 space-y-2 pb-6">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded-xl text-white text-xs font-semibold text-center" style={{ background: "rgba(255,122,0,0.2)", border: "1px solid rgba(255,122,0,0.4)" }}>{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-black text-white text-center" style={{ background: "linear-gradient(90deg,#FF7A00,#FDBA21)" }}>💾 Save Contact</div>
        <div className="w-full py-2 rounded border text-center" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,122,0,0.3)" }}>
          <span className="text-xs font-black tracking-widest" style={{ color: "#FF7A00" }}>CHAMPIONSHIP EDITION</span>
        </div>
      </div>
    </div>
  );

  if (layout === "lions_teranga") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#020f06,#004d1a)" }}>
      <div className="h-1 flex">
        <div className="flex-1" style={{ background: "#00853F" }} />
        <div className="flex-1" style={{ background: "#FDEF42" }} />
        <div className="flex-1" style={{ background: "#E31B23" }} />
      </div>
      <div className="px-4 py-6 text-center">
        <div className="text-3xl mb-2">⚽</div>
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2" style={{ borderColor: "#D4AF37", background: color }}>
            {profile?.profile_photo ? <img src={profile.profile_photo} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile?.display_name?.charAt(0) || "?"}</div>}
          </div>
        </div>
        <h1 className="font-black text-white text-xl">{profile?.display_name || "Your Name"}</h1>
        {profile?.job_title && <p className="text-sm font-semibold mt-0.5" style={{ color: "#FDEF42" }}>{profile.job_title}</p>}
        {profile?.bio && <p className="text-white/60 text-xs mt-2 leading-relaxed">{profile.bio}</p>}
      </div>
      <div className="px-4 space-y-2 pb-6">
        {links.map(l => <div key={l} className="w-full py-2.5 rounded-xl text-white text-xs font-semibold text-center" style={{ background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.4)" }}>{l}</div>)}
        <div className="w-full py-2.5 rounded-xl text-xs font-black text-black text-center" style={{ background: "linear-gradient(90deg,#D4AF37,#FDEF42)" }}>💾 Save Contact</div>
        <div className="w-full py-2 rounded border text-center" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(212,175,55,0.3)" }}>
          <span className="text-xs font-black tracking-widest" style={{ color: "#FDEF42" }}>LIONS DE LA TÉRANGA</span>
        </div>
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