/**
 * ProfileLayoutRenderer — 15 visually distinct public profile layouts.
 *
 * AVATAR ARCHITECTURE:
 * ─────────────────────────────────────────────────────────────────
 * Avatar is ALWAYS a sibling of (or outside) the cover element.
 * NO ancestor of the avatar may have overflow:hidden when it needs
 * to visually escape a cover edge. Layouts where avatar sits INSIDE
 * a full header (not escaping) may use overflow:hidden on that header.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Typography tokens ──────────────────────────────────────────
const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";

// ── Color helpers ──────────────────────────────────────────────
export const hexRgb = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string" || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Avatar shape → CSS border-radius ──────────────────────────
export function getAvatarRadius(shape) {
  const MAP = { circle: "50%", rounded: "22%", squircle: "28%", ios: "28%", card: "14px" };
  return MAP[shape] || "50%";
}

// ── AvatarRenderer ─────────────────────────────────────────────
export function AvatarRenderer({ profile, size = 96, extraStyle = {} }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  const color  = profile?.cover_color || "#2563eb";
  const initial = (profile?.display_name || "?").charAt(0).toUpperCase();
  const base = { width: size, height: size, borderRadius: radius, flexShrink: 0, display: "block", ...extraStyle };
  if (profile?.profile_photo) {
    return (
      <img src={profile.profile_photo} alt={profile.display_name || ""}
        style={{ ...base, objectFit: "cover", objectPosition: profile.avatar_position || "center top" }} />
    );
  }
  return (
    <div style={{
      ...base, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.62)})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38),
    }}>{initial}</div>
  );
}

// ── AvatarRing ─────────────────────────────────────────────────
function AvatarRing({ profile, size, ringColor = "#fff", ringWidth = 4, shadow, extraStyle = {} }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  return (
    <div style={{
      flexShrink: 0, padding: ringWidth,
      borderRadius: `calc(${radius} + ${ringWidth}px)`,
      background: ringColor,
      boxShadow: shadow || "0 8px 32px rgba(0,0,0,0.18)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      ...extraStyle,
    }}>
      <AvatarRenderer profile={profile} size={size} />
    </div>
  );
}

// ── Cover helpers ──────────────────────────────────────────────
function CoverBg({ profile, height, color, dimOpacity = 0.10, children, style = {} }) {
  return (
    <div style={{ height, position: "relative", flexShrink: 0, ...style }}>
      {profile?.cover_photo ? (
        <img src={profile.cover_photo} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.7)} 100%)` }} />
      )}
      {dimOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dimOpacity})` }} />
      )}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. CLASSIC — Circo-style: full-bleed cover, centered overlapping avatar, white card
// ═══════════════════════════════════════════════════════════════
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size  = mobile ? 96 : 112;
  const ringW = 4;
  const bg    = isDark ? "#111827" : "#f2f4f7";
  const cardBg= isDark ? "#1e293b" : "#fff";
  const text  = isDark ? "#fff" : "#0f172a";
  const sub   = isDark ? "rgba(255,255,255,0.5)" : "#64748b";
  const heroH = mobile ? 240 : 300;
  const pullUp= (size + ringW * 2) / 2;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* STICKY HEADER: cover + avatar + identity */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: bg }}>
        {/* HERO — full-bleed, NO overflow:hidden */}
        <div style={{ position: "relative", height: heroH }}>
          {profile?.cover_photo ? (
            <img src={profile.cover_photo} alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0,
              background: `linear-gradient(160deg, ${color} 0%, ${hexRgb(color, 0.65)} 60%, ${hexRgb(color, 0.35)} 100%)` }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.22) 60%, " + bg + " 100%)" }} />
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 5,
              width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.95)",
              padding: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", overflow: "hidden" }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* AVATAR — sibling, centered, zIndex:20 */}
        <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 20, marginTop: -pullUp }}>
          <div style={{
            padding: ringW,
            borderRadius: `calc(${getAvatarRadius(profile?.avatar_shape)} + ${ringW}px)`,
            background: cardBg,
            boxShadow: `0 0 0 2px ${hexRgb(color, 0.15)}, 0 16px 48px rgba(0,0,0,0.24)`,
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>

        {/* IDENTITY */}
        <div style={{ textAlign: "center", padding: mobile ? "14px 24px 12px" : "18px 40px 16px", position: "relative", zIndex: 5 }}>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: text, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color, fontFamily: FONT_BODY, letterSpacing: "0.01em" }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontWeight: 500, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
        </div>
      </div>

      {/* SCROLLABLE CONTENT CARD */}
      <div style={{
        margin: mobile ? "16px 14px 80px" : "20px 24px 80px",
        background: cardBg, borderRadius: 24,
        boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.45)" : "0 2px 20px rgba(0,0,0,0.07)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "none",
        padding: mobile ? "20px 16px 36px" : "28px 28px 56px",
      }}>
        {contentSections}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. MINIMAL — clean left accent stripe, no cover, horizontal compact header
// ═══════════════════════════════════════════════════════════════
export function MinimalLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 68 : 84;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#0f172a" : "#fff";
  const outerBg= isDark ? "#080d18" : "#f8fafc";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      {/* STICKY HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: outerBg }}>
        {/* Slim color rule at the very top */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.3)})` }} />

        {/* Cover strip — only if cover photo exists */}
        {profile?.cover_photo && (
          <div style={{ height: 110, position: "relative" }}>
            <img src={profile.cover_photo} alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.32)}, transparent)` }} />
          </div>
        )}

        {/* Header card — left accent border */}
        <div style={{ background: bg, borderLeft: `5px solid ${color}`, boxShadow: isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16,
            padding: mobile ? "20px 18px" : "24px 32px",
            borderBottom: `1px solid ${border}` }}>
            <div style={{ flexShrink: 0, border: `2.5px solid ${hexRgb(color, 0.25)}`, borderRadius: `calc(${radius} + 2.5px)` }}>
              <AvatarRenderer profile={profile} size={size} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 18 : 22, fontWeight: 800, color: text, fontFamily: FONT_DISPLAY, letterSpacing: "-0.015em" }}>{profile?.display_name}</h1>
              {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
              {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: sub, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 28px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. CARD COMPACT — slim color strip, floating white card, avatar inside card
// ═══════════════════════════════════════════════════════════════
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 60 : 72;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#1e293b" : "#fff";
  const outerBg= isDark ? "#0f172a" : "#f1f5f9";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8";
  const stripH = mobile ? 120 : 150;

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      {/* Color/photo strip */}
      <div style={{ height: stripH, position: "relative" }}>
        {profile?.cover_photo ? (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.55)})` }} />
        )}
        {/* Subtle left-edge tint — keep image visible */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${hexRgb(color, 0.25)}, transparent)` }} />
      </div>

      {/* STICKY: Floating card — overlaps strip */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: outerBg, paddingBottom: 8 }}>
        <div style={{
          background: bg, margin: mobile ? "0 12px" : "0 20px",
          borderRadius: 20, marginTop: -28, position: "relative", zIndex: 5,
          padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
        }}>
          <div style={{ flexShrink: 0, padding: 2.5,
            background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.48)})`,
            borderRadius: `calc(${radius} + 2.5px)` }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 16 : 19, fontWeight: 800, color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.01em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && <p style={{ margin: "0 0 1px", fontSize: 11.5, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 11, color: sub, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "8px 16px 120px" : "12px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. IMAGE HERO — full-bleed cover dominates, avatar bottom-right, name on gradient
// ═══════════════════════════════════════════════════════════════
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size      = mobile ? 84 : 100;
  const radius    = getAvatarRadius(profile?.avatar_shape);
  const ringW     = 4;
  const heroH     = mobile ? 320 : 420;
  const totalRing = size + ringW * 2;
  const bg        = isDark ? "#0f172a" : "#f8fafc";

  // If no cover photo, fall back to a colour gradient hero
  const hasPhoto = !!profile?.cover_photo;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Outer wrapper: no overflow:hidden so avatar can escape */}
      <div style={{ position: "relative", height: heroH + totalRing / 2 }}>
        {/* Inner: only this clips the image */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: heroH, overflow: "hidden" }}>
          {hasPhoto ? (
            <img src={profile.cover_photo} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          ) : (
            <div style={{ width: "100%", height: "100%",
              background: `linear-gradient(160deg, ${color} 0%, ${hexRgb(color, 0.6)} 60%, ${hexRgb(color, 0.3)} 100%)` }} />
          )}
          {/* Gradient overlay for name legibility — only at bottom 40% */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)" }} />

          {/* Company logo */}
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 14, left: 14, width: 44, height: 44, zIndex: 2,
              borderRadius: 10, background: "rgba(255,255,255,0.9)", padding: 4, overflow: "hidden" }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Name over gradient (leaves right side for avatar) */}
          <div style={{ position: "absolute", bottom: totalRing / 2 + 14, left: 0, right: size + 44,
            padding: mobile ? "0 18px" : "0 28px", zIndex: 3 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 28, fontWeight: 900, color: "#fff",
              textShadow: "0 2px 14px rgba(0,0,0,0.55)", lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 600, fontFamily: FONT_BODY }}>{profile.job_title}</p>
            )}
          </div>
        </div>

        {/* Avatar — on outer wrapper (NOT inside the clip div), zIndex 20 */}
        <div style={{ position: "absolute", bottom: 0, right: mobile ? 18 : 28, zIndex: 20 }}>
          <div style={{
            padding: ringW, background: "#fff",
            borderRadius: `calc(${radius} + ${ringW}px)`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>
      </div>

      {/* Company name below hero */}
      {profile?.company_name && (
        <p style={{ textAlign: "right", paddingRight: mobile ? 18 : 28, paddingTop: 6, paddingBottom: 2,
          fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b", fontWeight: 600 }}>
          {profile.company_name}
        </p>
      )}
      <div style={{ padding: mobile ? "6px 16px 120px" : "8px 28px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. GLASS — frosted glass header on vivid gradient background
// ═══════════════════════════════════════════════════════════════
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);

  return (
    <div style={{ minHeight: "100vh",
      background: profile?.cover_photo
        ? undefined
        : `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.5)} 50%, #c7d2fe 100%)`,
      position: "relative",
    }}>
      {/* Full-page cover photo as background */}
      {profile?.cover_photo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <img src={profile.cover_photo} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          {/* Light tint only — image must remain clearly visible */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(155deg, ${hexRgb(color, 0.38)}, ${hexRgb(color, 0.18)})` }} />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* STICKY: Frosted glass header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{
            padding: mobile ? "28px 20px 22px" : "36px 40px 28px",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
            borderBottom: "1px solid rgba(255,255,255,0.4)",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                padding: 5, background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                borderRadius: `calc(${radius} + 5px)`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(255,255,255,0.6)",
              }}>
                <AvatarRenderer profile={profile} size={size} />
              </div>
              <div style={{ padding: "14px 24px", borderRadius: 18,
                background: "rgba(255,255,255,0.58)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.8)" }}>
                <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>
                  {profile?.display_name}
                </h1>
                {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12.5, fontWeight: 700, color: hexRgb(color, 0.95), fontFamily: FONT_BODY }}>{profile.job_title}</p>}
                {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(15,23,42,0.5)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content on frosted white base */}
        <div style={{
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)",
          padding: mobile ? "18px 16px 120px" : "22px 32px 80px",
        }}>
          {contentSections}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. DARK PREMIUM — cinematic dark, cover photo with luminosity blend, glow ring
// ═══════════════════════════════════════════════════════════════
export function DarkPremiumLayout({ profile, color, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const coverH = mobile ? 200 : 260;
  const ringW  = 3;
  const accentColor = color || "#2563eb";

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh" }}>
      {/* Cover with luminosity blend for cinematic effect */}
      <div style={{ height: coverH, position: "relative", background: "linear-gradient(155deg, #0f1a2e, #0a0f1e)" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center",
              opacity: 0.72 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #0a0f1e 100%)" }} />
        {/* Glow blob */}
        <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)",
          width: 240, height: 100, background: accentColor, filter: "blur(80px)", opacity: 0.22 }} />
      </div>

      {/* STICKY: Avatar + Identity */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0a0f1e" }}>
        <div style={{ display: "flex", justifyContent: "center", position: "relative",
          marginTop: -((size + ringW * 2) * 0.5) }}>
          <div style={{
            padding: ringW,
            background: `linear-gradient(135deg, ${accentColor}, ${hexRgb(accentColor, 0.3)})`,
            borderRadius: `calc(${radius} + ${ringW}px)`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 16px 56px ${hexRgb(accentColor, 0.45)}`,
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: mobile ? "14px 20px 12px" : "18px 36px 14px", position: "relative", zIndex: 5 }}>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 23 : 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && (
            <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: accentColor, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT_BODY }}>
              {profile.job_title}
            </p>
          )}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.3)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          <div style={{ width: 52, height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, margin: "14px auto 0" }} />
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. AURORA — multi-color northern-lights gradient, glow bands, no cover
// ═══════════════════════════════════════════════════════════════
export function AuroraLayout({ profile, color, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const ac     = color || "#7c3aed";

  return (
    <div style={{ background: "linear-gradient(160deg,#0f0c29 0%,#302b63 45%,#24243e 100%)", minHeight: "100vh" }}>
      {/* STICKY: Aurora header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(160deg,#0f0c29 0%,#302b63 45%,#24243e 100%)" }}>
        {/* Aurora glow band */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${ac}88, #a855f788, #06b6d488, ${ac}88)` }} />

        <div style={{ padding: mobile ? "28px 20px 20px" : "36px 40px 28px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: "20%", width: 200, height: 140, background: ac, filter: "blur(90px)", opacity: 0.18, borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 50, right: "12%", width: 160, height: 110, background: "#a855f7", filter: "blur(90px)", opacity: 0.14, borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {profile?.cover_photo && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, overflow: "hidden", zIndex: 0 }}>
                <img src={profile.cover_photo} alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.6 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,12,41,0.3) 0%, rgba(15,12,41,0.95) 100%)" }} />
              </div>
            )}
            <div style={{ padding: 4, borderRadius: `calc(${radius} + 4px)`,
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
              boxShadow: `0 0 0 1.5px rgba(255,255,255,0.2), 0 16px 48px ${hexRgb(ac, 0.4)}` }}>
              <AvatarRenderer profile={profile} size={size} />
            </div>
            <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 23 : 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>{profile?.display_name}</h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT_BODY }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
            <div style={{ width: 60, height: 2, background: `linear-gradient(90deg, transparent, ${ac}, #a855f7, transparent)`, marginTop: 8 }} />
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)", padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. MAGAZINE — editorial: full-bleed top photo, identity row overlapping bottom edge
// ═══════════════════════════════════════════════════════════════
export function MagazineLayout({ profile, color, isDark, mobile, contentSections }) {
  const size    = mobile ? 72 : 88;
  const radius  = getAvatarRadius(profile?.avatar_shape);
  const bg      = isDark ? "#18181b" : "#fff";
  const text    = isDark ? "#fff" : "#09090b";
  const sub     = isDark ? "rgba(255,255,255,0.4)" : "#71717a";
  const border  = isDark ? "rgba(255,255,255,0.1)" : "#e4e4e7";
  const coverH  = mobile ? 220 : 300;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Full-bleed top photo or gradient */}
      <div style={{ height: coverH, position: "relative",
        background: `linear-gradient(160deg, #0f2027, ${color}88, #203a43)` }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55))" }} />
        {/* Magazine title tag — shows plan label */}
        <div style={{ position: "absolute", top: 16, left: 16, padding: "4px 12px",
          background: color, borderRadius: 4, zIndex: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {({ free: "Free", pro: "Pro", professional: "Professional", salon: "Salon", restaurant: "Restaurant", lawfirm: "Law Firm", business: "Business", corporate: "Corporate" })[profile?.plan] || "Profile"}
          </span>
        </div>
      </div>

      {/* STICKY: Identity row overlaps photo bottom */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: bg }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16,
          padding: mobile ? "0 18px 18px" : "0 32px 24px",
          marginTop: mobile ? -44 : -54, position: "relative" }}>
          <div style={{ flexShrink: 0, padding: 3, background: bg,
            borderRadius: `calc(${radius} + 3px)`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 19 : 23, fontWeight: 900,
              color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.015em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && (
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY,
                color: hexRgb(color, 0.9) }}>
                {profile.job_title}
              </p>
            )}
          </div>
        </div>
        {/* Ruled separator */}
        <div style={{ height: 1, background: border, margin: "0 18px" }} />
      </div>

      <div style={{ padding: mobile ? "10px 16px 120px" : "14px 28px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. EXECUTIVE — tall cover, name block left + avatar right (corporate)
// ═══════════════════════════════════════════════════════════════
export function ExecutiveLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 88 : 108;
  const ringW  = 4;
  const bg     = isDark ? "#0f172a" : "#fff";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const coverH = mobile ? 220 : 280;
  const pullUp = (size + ringW * 2) * 0.5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Tall cover */}
      <div style={{ height: coverH, position: "relative" }}>
        {profile?.cover_photo ? (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0,
            background: `linear-gradient(150deg, ${color} 0%, ${hexRgb(color, 0.55)} 100%)` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)" }} />
        {/* Company logo top-right */}
        {profile?.company_logo && (
          <div style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, zIndex: 2,
            borderRadius: 10, background: "rgba(255,255,255,0.92)", padding: 4, overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
      </div>

      {/* STICKY: Identity row + accent rule */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: bg }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16,
          padding: mobile ? "0 18px 14px" : "0 36px 18px",
          marginTop: -pullUp, position: "relative" }}>
          <div style={{ flex: 1, paddingBottom: 6, paddingTop: size * 0.55 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 25, fontWeight: 900, color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12.5, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontWeight: 600, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          </div>
          <AvatarRing profile={profile} size={size} ringColor={bg} ringWidth={ringW}
            shadow={`0 0 0 3px ${hexRgb(color, 0.2)}, 0 16px 48px rgba(0,0,0,0.2)`} />
        </div>
        {/* Gold/color accent rule */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.2)} 70%, transparent)` }} />
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. MODERN SAAS / SPLIT — accent top bar, horizontal header card
// ═══════════════════════════════════════════════════════════════
export function ModernSaasLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 76 : 92;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#0f172a" : "#f1f5f9";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Gradient accent top bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.35)})` }} />

      {/* Cover strip — if available */}
      {profile?.cover_photo && (
        <div style={{ height: 110, position: "relative" }}>
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.28)}, transparent)` }} />
        </div>
      )}

      {/* STICKY: Horizontal header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ background: cardBg, padding: mobile ? "22px 18px" : "28px 36px",
          display: "flex", alignItems: "center", gap: 18,
          borderBottom: `1px solid ${border}`,
          boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ flexShrink: 0, padding: 3,
            background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.42)})`,
            borderRadius: `calc(${radius} + 3px)`,
            boxShadow: `0 8px 24px ${hexRgb(color, 0.28)}` }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 19 : 23, fontWeight: 900, color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.015em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12.5, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontWeight: 600, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          </div>
          {profile?.company_logo && (
            <img src={profile.company_logo} alt=""
              style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0,
                borderRadius: 8, border: `1px solid ${border}` }} />
          )}
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 11. BOLD GRADIENT — vivid full-color header, avatar inside, wave SVG divider
// ═══════════════════════════════════════════════════════════════
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 106 : 126;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#0f172a" : "#f8fafc";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* STICKY: Color hero header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{
          padding: mobile ? "28px 20px 0" : "36px 40px 0",
          background: `linear-gradient(150deg, ${color} 0%, ${hexRgb(color, 0.75)} 55%, ${hexRgb(color, 0.45)} 100%)`,
          position: "relative", textAlign: "center",
        }}>
          {profile?.cover_photo && (
            <img src={profile.cover_photo} alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: profile.cover_position || "center",
                opacity: 0.35, pointerEvents: "none" }} />
          )}
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40,
              borderRadius: 8, background: "rgba(255,255,255,0.88)", padding: 4, overflow: "hidden", zIndex: 2 }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}

          <div style={{ position: "relative", zIndex: 3 }}>
            <div style={{ display: "inline-block", padding: 5,
              background: "rgba(255,255,255,0.28)", backdropFilter: "blur(8px)",
              borderRadius: `calc(${radius} + 5px)`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.22)", marginBottom: 12 }}>
              <AvatarRenderer profile={profile} size={size} />
            </div>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#fff",
              textShadow: "0 2px 8px rgba(0,0,0,0.18)", fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: FONT_BODY }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "rgba(255,255,255,0.6)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          </div>

          {/* Wave divider */}
          <div style={{ height: 36, position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 400 36" preserveAspectRatio="none"
              style={{ position: "absolute", bottom: 0, width: "100%", height: 36 }}>
              <path d="M0,18 C100,36 300,0 400,18 L400,36 L0,36 Z" fill={bg} />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "10px 16px 120px" : "14px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 12. NEON — near-black bg, scanlines, vivid neon glow ring
// ═══════════════════════════════════════════════════════════════
export function NeonLayout({ profile, color, mobile, contentSections }) {
  const size   = mobile ? 88 : 108;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const neon   = color || "#00ffcc";

  return (
    <div style={{ background: "#060912", minHeight: "100vh" }}>
      {/* STICKY: Glowing header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{
          padding: mobile ? "32px 20px 24px" : "44px 40px 32px",
          background: "linear-gradient(175deg, #0c0e1e, #060912)",
          textAlign: "center", position: "relative",
          borderBottom: `1px solid ${hexRgb(neon, 0.2)}`,
        }}>
          {profile?.cover_photo && (
            <img src={profile.cover_photo} alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: profile.cover_position || "center",
                opacity: 0.45 }} />
          )}
          <div style={{ position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
            pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 300, height: 150, background: neon, filter: "blur(90px)", opacity: 0.12 }} />

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              padding: 3, borderRadius: `calc(${radius} + 3px)`,
              boxShadow: `0 0 0 1.5px ${neon}, 0 0 20px ${hexRgb(neon, 0.55)}, 0 0 60px ${hexRgb(neon, 0.2)}`,
              background: "#0c0e1e",
            }}>
              <AvatarRenderer profile={profile} size={size} />
            </div>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#fff",
                textShadow: `0 0 20px ${hexRgb(neon, 0.5)}`, fontFamily: FONT_DISPLAY, letterSpacing: "-0.015em" }}>
                {profile?.display_name}
              </h1>
              {profile?.job_title && (
                <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: neon, fontFamily: FONT_BODY,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  textShadow: `0 0 12px ${hexRgb(neon, 0.7)}` }}>
                  {profile.job_title}
                </p>
              )}
              {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.3)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 13. RETRO — warm paper texture, dashed border rules, offset avatar shadow
// ═══════════════════════════════════════════════════════════════
export function RetroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 80 : 96;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const pageBg = isDark ? "#1a1005" : "#faf6ef";
  const cardBg = isDark ? "#2a1e08" : "#fffdf7";
  const text   = isDark ? "#f5e6c8" : "#1a0e00";
  const sub    = isDark ? "#a89060" : "#8b6b3a";
  const accent = color;

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      {/* Cover strip — sepia toned if present */}
      {profile?.cover_photo && (
        <div style={{ height: mobile ? 130 : 160, position: "relative" }}>
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center",
              filter: "sepia(20%) saturate(90%) brightness(0.95)" }} />
          <div style={{ position: "absolute", inset: 0,
            background: `linear-gradient(to bottom, transparent 40%, ${pageBg} 100%)` }} />
        </div>
      )}

      {/* STICKY: Retro header band */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{
          background: cardBg, borderBottom: `3px double ${hexRgb(accent, 0.5)}`,
          padding: mobile ? "24px 18px 18px" : "32px 36px 22px", position: "relative",
          marginTop: profile?.cover_photo ? (mobile ? -20 : -24) : 0,
        }}>
          <div style={{ height: 3, background: `repeating-linear-gradient(90deg, ${accent} 0, ${accent} 8px, transparent 8px, transparent 14px)`, marginBottom: 20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flexShrink: 0,
              border: `3px solid ${accent}`,
              borderRadius: `calc(${radius} + 3px)`,
              boxShadow: `4px 4px 0 ${hexRgb(accent, 0.3)}` }}>
              <AvatarRenderer profile={profile} size={size} />
            </div>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 26, fontWeight: 900, color: text, lineHeight: 1.1,
                fontFamily: FONT_DISPLAY, letterSpacing: "-0.01em" }}>
                {profile?.display_name}
              </h1>
              {profile?.job_title && (
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT_BODY }}>
                  {profile.job_title}
                </p>
              )}
              {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 14. FLOATING — radial background, identity card + content card both floating
// ═══════════════════════════════════════════════════════════════
export function FloatingLayout({ profile, color, isDark, mobile, contentSections }) {
  const size    = mobile ? 72 : 88;
  const radius  = getAvatarRadius(profile?.avatar_shape);
  const outerBg = isDark
    ? "#0f172a"
    : `radial-gradient(ellipse at top, ${hexRgb(color, 0.14)} 0%, #f1f5f9 60%)`;
  const cardBg  = isDark ? "#1e293b" : "#fff";
  const text    = isDark ? "#fff" : "#0f172a";
  const sub     = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  return (
    <div style={{ background: outerBg, minHeight: "100vh", padding: mobile ? "28px 16px 120px" : "44px 28px 80px" }}>
      {/* Cover photo strip — if present, floats above cards */}
      {profile?.cover_photo && (
        <div style={{ borderRadius: 20, overflow: "hidden", height: mobile ? 130 : 160,
          marginBottom: 16, position: "relative",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}>
          <img src={profile.cover_photo} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${hexRgb(color, 0.4)})` }} />
        </div>
      )}

      {/* Floating identity card */}
      <div style={{ background: cardBg, borderRadius: 28,
        boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.6)" : `0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px ${hexRgb(color, 0.08)}`,
        padding: "28px 24px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12, marginBottom: 16, position: "relative" }}>
        {/* Accent top strip */}
        <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius: "0 0 4px 4px" }} />
        <div style={{ padding: 4, borderRadius: `calc(${radius} + 4px)`,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.4)})`,
          boxShadow: `0 8px 28px ${hexRgb(color, 0.32)}` }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 24, fontWeight: 900, color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>{profile?.display_name}</h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 12.5, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
        </div>
      </div>

      {/* Content floats below */}
      <div style={{ background: cardBg, borderRadius: 24,
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 2px 20px rgba(0,0,0,0.07)",
        padding: "16px 16px 32px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 15. LUXURY GOLD — black + dark brown bg, gold gradient ring, gold accents throughout
// ═══════════════════════════════════════════════════════════════
export function LuxuryGoldLayout({ profile, mobile, contentSections }) {
  const size    = mobile ? 100 : 120;
  const radius  = getAvatarRadius(profile?.avatar_shape);
  const gold    = "#B8860B";
  const goldLt  = "#FFD700";
  const coverH  = mobile ? 200 : 260;
  const ringW   = 3;

  return (
    <div style={{ background: "#0c0700", minHeight: "100vh" }}>
      {/* Cover — desaturated gold tint */}
      <div style={{ height: coverH, position: "relative", background: "linear-gradient(155deg, #1a1000, #0c0700)" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center",
              opacity: 0.65 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 25%, #0c0700 100%)" }} />
        {/* Gold glow */}
        <div style={{ position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)",
          width: 220, height: 80, background: gold, filter: "blur(70px)", opacity: 0.35 }} />
        {/* Gold corner ornament */}
        <div style={{ position: "absolute", top: 14, right: 14, fontSize: 22 }}>👑</div>
      </div>

      {/* STICKY: Avatar + Identity */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0c0700" }}>
        <div style={{ display: "flex", justifyContent: "center", position: "relative",
          marginTop: -((size + ringW * 2) * 0.5) }}>
          <div style={{
            padding: ringW,
            background: `linear-gradient(135deg, ${goldLt}, ${gold}, #8B6914)`,
            borderRadius: `calc(${radius} + ${ringW}px)`,
            boxShadow: `0 0 0 1px rgba(255,215,0,0.15), 0 16px 56px ${hexRgb(gold, 0.5)}`,
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: mobile ? "14px 20px 12px" : "18px 36px 14px", position: "relative", zIndex: 5 }}>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 23 : 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && (
            <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: goldLt, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT_BODY,
              textShadow: `0 0 12px ${hexRgb(goldLt, 0.5)}` }}>
              {profile.job_title}
            </p>
          )}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.28)", fontFamily: FONT_BODY }}>{profile.company_name}</p>}
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "14px auto 0" }} />
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PASTEL (kept for backward compat with old profiles) — routes to ColorLayout
// ═══════════════════════════════════════════════════════════════
export function PastelLayout({ profile, color, mobile, contentSections }) {
  return <ColorLayout profile={profile} color={color} isDark={false} mobile={mobile} contentSections={contentSections} />;
}

// ═══════════════════════════════════════════════════════════════
// PORTRAIT (backward compat)
// ═══════════════════════════════════════════════════════════════
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size  = mobile ? 130 : 158;
  const ringW = 5;
  const bg    = isDark ? "#0f172a" : "#f8fafc";
  const cardBg= isDark ? "#1e293b" : "#fff";
  const text  = isDark ? "#fff" : "#0f172a";
  const sub   = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const coverH= mobile ? 120 : 140;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <div style={{ height: coverH, position: "relative" }}>
        {profile?.cover_photo ? (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.7)} 100%)` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, " + bg + " 100%)" }} />
      </div>

      {/* STICKY: Avatar + identity */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: bg }}>
        <div style={{ display: "flex", justifyContent: "center", position: "relative", marginTop: -((size + ringW * 2) / 2) }}>
          <div style={{ padding: ringW, borderRadius: `calc(${getAvatarRadius(profile?.avatar_shape)} + ${ringW}px)`,
            background: cardBg, boxShadow: `0 0 0 4px ${hexRgb(color, 0.25)}, 0 24px 64px ${hexRgb(color, 0.3)}` }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: mobile ? "16px 20px 12px" : "20px 44px 14px", position: "relative", zIndex: 5 }}>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: text, lineHeight: 1.1, fontFamily: FONT_DISPLAY, letterSpacing: "-0.025em" }}>{profile?.display_name}</h1>
          {profile?.job_title && <p style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color, fontFamily: FONT_BODY }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: "0 0 4px", fontSize: 12.5, color: sub, fontFamily: FONT_BODY }}>{profile.company_name}</p>}
        </div>
      </div>

      <div style={{ padding: mobile ? "6px 16px 120px" : "10px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// Backward-compat aliases
export { AuroraLayout as WaveLayout, ColorLayout as BubblyLayout, ColorLayout as SunsetLayout };
export { ModernSaasLayout as SplitLayout };