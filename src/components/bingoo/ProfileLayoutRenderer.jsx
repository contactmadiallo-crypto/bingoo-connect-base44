/**
 * ProfileLayoutRenderer — 10 distinct public profile layouts.
 *
 * ARCHITECTURE:
 *   ProfileLayout
 *   ├── CoverLayer          (no overflow:hidden on outer wrapper)
 *   ├── AvatarLayer         (sibling to CoverLayer, zIndex > cover)
 *   ├── IdentityLayer       (name / title / company)
 *   └── ContentLayer        (contentSections)
 *
 * RULES:
 * - CoverImage outer div: NEVER overflow:hidden — avatar must escape it
 * - AvatarLayer: position:relative, zIndex >= 10, marginTop negative to overlap cover
 * - Avatar component: single source of truth for shape + focal point
 * - No hardcoded borderRadius — always use getAvatarRadius(profile.avatar_shape)
 */

// ── Colour helpers ─────────────────────────────────────────
export const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Avatar shape → CSS border-radius ──────────────────────
export function getAvatarRadius(shape) {
  const MAP = { circle: "50%", rounded: "22%", squircle: "28%", ios: "28%", card: "14px" };
  return MAP[shape] || "50%";
}

// ── Shared Avatar component ────────────────────────────────
// Single source of truth used by EVERY layout. Never clips shape.
export function AvatarRenderer({ profile, size, extraStyle = {} }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  const color = profile?.cover_color || "#2563eb";
  const initial = (profile?.display_name || "?").charAt(0).toUpperCase();

  const base = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: "block",
  };

  if (profile?.profile_photo) {
    return (
      <img
        src={profile.profile_photo}
        alt={profile.display_name || ""}
        style={{
          ...base,
          objectFit: "cover",
          objectPosition: profile.avatar_position || "center top",
          ...extraStyle,
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.65)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: Math.round(size * 0.38),
        ...extraStyle,
      }}
    >
      {initial}
    </div>
  );
}

// ── AvatarRing — white-border wrapper ─────────────────────
// Must NOT use overflow:hidden — that would clip non-circular shapes.
function AvatarRing({ profile, size, ringColor = "#fff", ringWidth = 4, shadow, extraStyle = {}, children }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: size + ringWidth * 2,
        height: size + ringWidth * 2,
        borderRadius: `calc(${radius} + ${ringWidth}px)`,
        background: ringColor,
        boxShadow: shadow || `0 8px 32px rgba(0,0,0,0.18)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...extraStyle,
      }}
    >
      {children || <AvatarRenderer profile={profile} size={size} />}
    </div>
  );
}

// ── CoverImage ─────────────────────────────────────────────
// CRITICAL: outer div has NO overflow:hidden — avatar floats above it via sibling
function CoverImage({ profile, height, color, dimOpacity = 0, children }) {
  return (
    <div
      style={{
        height,
        position: "relative",
        flexShrink: 0,
        background: profile?.cover_photo
          ? undefined
          : `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.65)})`,
        // NO overflow:hidden here — avatar must be able to overlap outside
      }}
    >
      {profile?.cover_photo && (
        <img
          src={profile.cover_photo}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: profile.cover_position || "center",
          }}
        />
      )}
      {dimOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dimOpacity})` }} />
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 1. CLASSIC — bright cover, avatar overlaps below (placement-aware)
// ─────────────────────────────────────────────────────────
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 100 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const placement = profile?.avatar_placement || "center_overlap";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 180 : 220;
  const ringW = 4;

  // Placement → justify + padding
  const hAlign =
    placement === "right_overlap" ? "flex-end"
    : placement === "left_overlap" ? "flex-start"
    : "center";
  const hPad =
    (placement === "right_overlap" || placement === "left_overlap") ? 24 : 0;
  // lower_center: pull up only 30% of avatar; others 50%
  const pullUp = placement === "lower_center" ? (size + ringW * 2) * 0.3 : (size + ringW * 2) * 0.5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* CoverLayer — no overflow hidden */}
      <CoverImage profile={profile} height={coverH} color={color}>
        {profile?.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 44, height: 44, borderRadius: 10, background: "#fff", padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 2 }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
      </CoverImage>

      {/* AvatarLayer — SIBLING to cover, zIndex 10, overlaps via negative marginTop */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: hAlign,
          paddingLeft: hPad,
          paddingRight: hPad,
          marginTop: -pullUp,
        }}
      >
        <AvatarRing
          profile={profile}
          size={size}
          ringColor={cardBg}
          ringWidth={ringW}
          shadow={`0 0 0 3px ${hexRgb(color, 0.18)}, 0 16px 48px rgba(0,0,0,0.18)`}
        />
      </div>

      {/* IdentityLayer */}
      <div style={{ textAlign: "center", padding: mobile ? "14px 24px 0" : "16px 40px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile?.display_name}</h1>
        {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color }}>{profile.job_title}</p>}
        {profile?.company_name && <p style={{ margin: "0 0 16px", fontSize: 13, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
      </div>

      {/* ContentLayer */}
      <div style={{ padding: mobile ? "12px 18px 120px" : "16px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 2. PORTRAIT — giant centered avatar, short accent banner
// ─────────────────────────────────────────────────────────
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 130 : 160;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 120 : 140;
  const ringW = 5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* AvatarLayer — centered, overlaps cover by 50% */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 10, marginTop: -((size + ringW * 2) * 0.5) }}>
        <AvatarRing
          profile={profile}
          size={size}
          ringColor={cardBg}
          ringWidth={ringW}
          shadow={`0 0 0 4px ${hexRgb(color, 0.25)}, 0 24px 64px ${hexRgb(color, 0.3)}`}
        />
      </div>

      <div style={{ textAlign: "center", padding: mobile ? "18px 24px 0" : "22px 48px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile?.display_name}</h1>
        {profile?.job_title && <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color }}>{profile.job_title}</p>}
        {profile?.company_name && <p style={{ margin: "0 0 20px", fontSize: 13, color: subColor }}>{profile.company_name}</p>}
      </div>

      <div style={{ padding: mobile ? "8px 18px 120px" : "12px 40px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3. FULL IMAGE HERO — full-bleed cover, avatar bottom-right, name bottom-left
//    Avatar is OUTSIDE the overflow:hidden hero div — positioned absolutely
//    relative to a wrapper that extends below the hero.
// ─────────────────────────────────────────────────────────
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 84 : 100;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const ringW = 4;

  if (!profile?.cover_photo) return <ClassicLayout profile={profile} color={color} isDark={isDark} mobile={mobile} contentSections={contentSections} />;

  const heroH = mobile ? 300 : 400;
  const avatarTotalSize = size + ringW * 2;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/*
        Hero wrapper: position relative, height = heroH + half avatar so the avatar
        can sit half in / half out WITHOUT overflow:hidden on this wrapper.
        The actual clip is ONLY on the inner img container (not the outer wrapper).
      */}
      <div style={{ position: "relative", height: heroH + avatarTotalSize / 2 }}>
        {/* Inner image clip — only clips the image, not the avatar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: heroH, overflow: "hidden" }}>
          <img
            src={profile.cover_photo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile?.cover_position || "center" }}
          />
          {/* Bottom gradient for text legibility */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }} />

          {/* Company logo — top left */}
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 14, left: 14, width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.9)", padding: 4, overflow: "hidden", backdropFilter: "blur(8px)", zIndex: 2 }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Name / title over gradient at bottom-left */}
          <div style={{ position: "absolute", bottom: avatarTotalSize / 2 + 12, left: 0, right: size + 40, padding: mobile ? "0 20px" : "0 32px", zIndex: 3 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 28, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)", lineHeight: 1.1 }}>{profile?.display_name}</h1>
            {profile?.job_title && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{profile.job_title}</p>}
          </div>
        </div>

        {/* AvatarLayer — positioned on the outer wrapper, NOT inside the clip div */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: mobile ? 20 : 32,
            zIndex: 10,
          }}
        >
          <AvatarRing
            profile={profile}
            size={size}
            ringColor="#fff"
            ringWidth={ringW}
            shadow="0 12px 40px rgba(0,0,0,0.3)"
          />
        </div>
      </div>

      {/* Content below hero */}
      <div style={{ paddingTop: 12 }}>
        {profile?.company_name && (
          <p style={{ textAlign: "right", paddingRight: mobile ? 20 : 32, paddingBottom: 4, fontSize: 13, color: "#64748b", fontWeight: 600 }}>{profile.company_name}</p>
        )}
        <div style={{ padding: mobile ? "0 18px 120px" : "0 32px 80px" }}>{contentSections}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 4. GLASS CARD — frosted glass gradient bg, avatar inside glass header
// ─────────────────────────────────────────────────────────
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const darkShade = "rgba(15,23,42,0.9)";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.5)} 55%, #c7d2fe 100%)` }}>
      {/* Glass header — avatar lives INSIDE this panel, no cover overlap needed */}
      <div
        style={{
          margin: 0,
          padding: mobile ? "44px 20px 36px" : "60px 40px 44px",
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          textAlign: "center",
          position: "relative",
          // overflow:hidden is SAFE here because avatar is not overlapping a cover
          overflow: "hidden",
        }}
      >
        {/* Cover photo as very faint background tint */}
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.1, pointerEvents: "none" }} />
        )}

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Avatar with frosted ring */}
          <div
            style={{
              padding: 5,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: `calc(${radius} + 5px)`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(255,255,255,0.6)",
            }}
          >
            <AvatarRenderer profile={profile} size={size} />
          </div>

          {/* Name pill */}
          <div style={{ padding: "14px 28px", borderRadius: 18, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: darkShade, lineHeight: 1.1 }}>{profile?.display_name}</h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: hexRgb(color, 0.95) }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(15,23,42,0.6)" }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", padding: mobile ? "20px 18px 120px" : "24px 36px 80px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 5. MODERN SAAS — accent bar, horizontal header, avatar LEFT
// ─────────────────────────────────────────────────────────
export function ModernSaasLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 76 : 92;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg = isDark ? "#0f172a" : "#f1f5f9";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Top accent bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.35)})` }} />

      {/* Optional slim cover */}
      {profile?.cover_photo && (
        <div style={{ height: 80, overflow: "hidden", position: "relative" }}>
          <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.5)}, transparent)` }} />
        </div>
      )}

      {/* Horizontal header — avatar INSIDE card, no overlap with cover */}
      <div style={{ background: cardBg, padding: mobile ? "24px 20px" : "28px 40px", display: "flex", alignItems: "center", gap: 20, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
        <div style={{ flexShrink: 0, padding: 3, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.45)})`, borderRadius: `calc(${radius} + 3px)`, boxShadow: `0 8px 24px ${hexRgb(color, 0.28)}` }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 19 : 23, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile?.display_name}</h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>

        {profile?.company_logo && (
          <img src={profile.company_logo} alt="" style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0, borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` }} />
        )}
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 6. DARK PREMIUM — cinematic dark, glow avatar, dimmed cover
// ─────────────────────────────────────────────────────────
export function DarkPremiumLayout({ profile, color, isDark: _isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const coverH = mobile ? 170 : 210;
  const ringW = 3;

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh" }}>
      {/* CoverLayer — dimmed cinematic */}
      <div style={{ height: coverH, position: "relative", background: "linear-gradient(155deg, #0f1a2e, #0a0f1e)" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.3, mixBlendMode: "luminosity" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #0a0f1e 100%)" }} />
        {/* Glow blob */}
        <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, background: color, filter: "blur(60px)", opacity: 0.28 }} />
      </div>

      {/* AvatarLayer — sibling to cover, overlaps via negative marginTop */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 10, marginTop: -((size + ringW * 2) * 0.5) }}>
        <div style={{
          padding: ringW,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.35)})`,
          borderRadius: `calc(${radius} + ${ringW}px)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px ${hexRgb(color, 0.4)}`,
        }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: mobile ? "14px 24px 0" : "18px 40px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 23 : 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{profile?.display_name}</h1>
        {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{profile.job_title}</p>}
        {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{profile.company_name}</p>}
        <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "14px auto 0" }} />
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 7. EXECUTIVE — name LEFT, avatar RIGHT, both overlap cover
// ─────────────────────────────────────────────────────────
export function ExecutiveLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 200 : 260;
  const ringW = 4;
  const pullUp = (size + ringW * 2) * 0.5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* AvatarLayer + NameLayer — flex row, both overlap cover */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          padding: mobile ? "0 20px" : "0 40px",
          marginTop: -pullUp,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Name block */}
        <div style={{ flex: 1, paddingBottom: 6, paddingTop: size * 0.6 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 25, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile?.display_name}</h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>

        {/* Avatar right */}
        <AvatarRing
          profile={profile}
          size={size}
          ringColor={bg}
          ringWidth={ringW}
          shadow={`0 0 0 3px ${hexRgb(color, 0.2)}, 0 16px 48px rgba(0,0,0,0.2)`}
        />
      </div>

      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.25)} 70%, transparent)`, margin: "16px 0 0" }} />
      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 8. MINIMAL — left accent bar, horizontal compact header, no big cover
// ─────────────────────────────────────────────────────────
export function MinimalLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 68 : 80;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const outerBg = isDark ? "#0a0e1a" : "#f8fafc";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      <div style={{ background: bg, borderLeft: `5px solid ${color}` }}>
        {profile?.cover_photo && (
          <div style={{ height: 70, overflow: "hidden", position: "relative" }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: mobile ? "18px 20px" : "22px 32px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
          {/* Avatar with subtle border */}
          <div style={{ flexShrink: 0, border: `2px solid ${hexRgb(color, 0.2)}`, borderRadius: `calc(${radius} + 2px)` }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 17 : 21, fontWeight: 900, color: textColor }}>{profile?.display_name}</h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9. COLOR / GRADIENT — vibrant color hero, wave divider, centered avatar
// ─────────────────────────────────────────────────────────
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 106 : 126;
  const radius = getAvatarRadius(profile?.avatar_shape);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Color hero */}
      <div
        style={{
          padding: mobile ? "40px 20px 0" : "56px 40px 0",
          background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.72)} 60%, ${hexRgb(color, 0.45)} 100%)`,
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, mixBlendMode: "overlay" }} />
        )}
        {profile?.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.88)", padding: 4, overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Avatar on color bg — no cover to clip it, safe here */}
        <div style={{ display: "inline-block", padding: 5, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)", borderRadius: `calc(${radius} + 5px)`, boxShadow: "0 8px 32px rgba(0,0,0,0.22)", marginBottom: 16 }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>

        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 25 : 29, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{profile?.display_name}</h1>
        {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{profile.job_title}</p>}
        {profile?.company_name && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{profile.company_name}</p>}

        {/* Wave divider */}
        <div style={{ marginTop: 28, height: 36, position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 400 36" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 36 }}>
            <path d="M0,18 C100,36 300,0 400,18 L400,36 L0,36 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      <div style={{ padding: mobile ? "12px 18px 120px" : "16px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 10. CARD COMPACT — slim color strip, floating white card below
// ─────────────────────────────────────────────────────────
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 60 : 68;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg = isDark ? "#1e293b" : "#fff";
  const outerBg = isDark ? "#0f172a" : "#f1f5f9";
  const textColor = isDark ? "#fff" : "#0f172a";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      {/* Slim color strip */}
      <div style={{ height: mobile ? 88 : 108, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, position: "relative", overflow: "hidden" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.6 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${hexRgb(color, 0.55)}, transparent)` }} />
      </div>

      {/* Floating card — overlaps strip. Avatar is INSIDE the card, not overlapping the strip's overflow:hidden */}
      <div
        style={{
          background: bg,
          margin: mobile ? "0 12px" : "0 24px",
          borderRadius: 20,
          marginTop: -28,
          position: "relative",
          zIndex: 5,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
        }}
      >
        <div style={{ flexShrink: 0, padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: `calc(${radius} + 2px)` }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 15 : 17, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile?.display_name}</h1>
          {profile?.job_title && <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>{profile.company_name}</p>}
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 18px 120px" : "18px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}