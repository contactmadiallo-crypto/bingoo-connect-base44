import WalletPassButtons from "@/components/bingoo/WalletPassButtons";
import { publicProfileUrl } from "@/lib/publicProfileUrl";

export default function OwnerWalletPanel({ profile, isDark, panelBorder, panelBg, headText, mutedText }) {
  const profileUrl = publicProfileUrl(profile?.username || "profile");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl)}&color=0b2149&bgcolor=ffffff`;
  const coverColor = profile?.cover_color || "#0b2149";

  return (
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
      <div>
        <p className={`font-black text-lg ${headText}`}>Digital Wallet Card</p>
        <p className={`text-xs ${mutedText}`}>Always in their pocket, ready to tap.</p>
      </div>

      <div className="relative overflow-hidden rounded-[24px] min-h-[300px] p-6 text-white shadow-xl"
        style={{ background: `radial-gradient(circle at 88% 82%, rgba(249,115,22,.55), transparent 28%), linear-gradient(135deg, ${coverColor} 0%, #17366d 58%, #13284f 100%)` }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(120deg, transparent 25%, rgba(255,255,255,.12) 50%, transparent 72%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider">
            <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">∞</span>
            BINGOO
          </div>
          <span className="w-10 h-7 rounded-lg border border-white/30 bg-white/5" />
        </div>

        <div className="relative z-10 mt-8 flex items-center gap-3">
          {profile?.profile_photo ? (
            <img src={profile.profile_photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/50" />
          ) : (
            <span className="w-14 h-14 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center font-black text-xl">
              {profile?.display_name?.charAt(0) || "B"}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-black text-lg truncate">{profile?.display_name || "Bingoo Profile"}</p>
            <p className="text-xs text-white/65 truncate">{profile?.job_title || profile?.company_name || "Digital Profile"}</p>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Profile</p>
            <p className="text-xs text-white/75 truncate">{profileUrl}</p>
          </div>
          <img src={qrUrl} alt="Wallet card QR code" className="w-12 h-12 rounded-lg bg-white p-1 flex-shrink-0" />
        </div>
      </div>

      <WalletPassButtons profile={profile} color={coverColor} isDark={isDark} stacked />

      <p className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
        Download your QR code for business cards, email signatures, and social profiles.
      </p>
    </div>
  );
}
