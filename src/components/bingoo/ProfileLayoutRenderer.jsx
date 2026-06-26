/**
 * ProfileLayoutRenderer — 12 visually distinct public profile layouts.
 *
 * AVATAR ARCHITECTURE (enforced in every layout):
 * ─────────────────────────────────────────────────────────────────
 * The avatar MUST always be a SIBLING of (or outside) the cover block.
 * NO ancestor of the avatar may have overflow:hidden.
 * The avatar is pulled up over the cover via negative marginTop on its
 * own wrapper div, which has position:relative + zIndex:20.
 *
 * For layouts where the avatar lives INSIDE a header (no cover-overlap),
 * overflow:hidden is OK on that header because there is nothing to clip.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Color helpers ──────────────────────────────────────────
export const hexRgb = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string" || hex.length < 7) return `rgba(0,0,0,${alpha})`;
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

// ── AvatarRenderer ─────────────────────────────────────────
// Single source of truth. Never wraps in overflow:hidden.
export function AvatarRenderer({ profile, size = 96, extraStyle = {} }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  const color  = profile?.cover_color || "#2563eb";
  const initial = (profile?.display_name || "?").charAt(0).toUpperCase();

  const base = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: "block",
    ...extraStyle,
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
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.62)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initial}
    </div>
  );
}

// ── AvatarRing ─────────────────────────────────────────────
// White (or custom) border ring around avatar. NO overflow:hidden.
function AvatarRing({ profile, size, ringColor = "#fff", ringWidth = 4, shadow, extraStyle = {} }) {
  const radius = getAvatarRadius(profile?.avatar_shape);
  return (
    <div
      style={{
        flexShrink: 0,
        padding: ringWidth,
        borderRadius: `calc(${radius} + ${ringWidth}px)`,
        background: ringColor,
        boxShadow: shadow || "0 8px 32px rgba(0,0,0,0.18)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...extraStyle,
      }}
    >
      <AvatarRenderer profile={profile} size={size} />
    </div>
  );
}

// ── CoverImage ─────────────────────────────────────────────
// CRITICAL: outer container has NO overflow:hidden so avatar siblings
// can visually overlap it using negative marginTop.
function CoverImage({ profile, height, color, dimOpacity = 0, children }) {
  return (
    <div
      style={{
        height,
        position: "relative",
        flexShrink: 0,
        // NO overflow:hidden on this element
        background: profile?.cover_photo
          ? undefined
          : `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.7)} 100%)`,
      }}
    >
      {profile?.cover_photo && (
        <img
          src={profile.cover_photo}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
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

// ── AvatarLayer ────────────────────────────────────────────
// Sibling to CoverImage. zIndex:20. Pulls up over cover via negative marginTop.
// placement controls horizontal alignment.
function AvatarLayer({ profile, size, ringColor, ringWidth = 4, shadow, placement = "center_overlap" }) {
  const pullUp = (size + ringWidth * 2) * (placement === "lower_center" ? 0.28 : 0.5);
  const justifyContent =
    placement === "right_overlap" ? "flex-end"
    : placement === "left_overlap" ? "flex-start"
    : "center";
  const px = (placement === "right_overlap" || placement === "left_overlap") ? 24 : 0;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        justifyContent,
        paddingLeft: px,
        paddingRight: px,
        marginTop: -pullUp,
        pointerEvents: "none", // allow clicking through
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <AvatarRing
          profile={profile}
          size={size}
          ringColor={ringColor || "#fff"}
          ringWidth={ringWidth}
          shadow={shadow}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 1. CLASSIC — white card, colored cover, centered avatar overlap
// ═══════════════════════════════════════════════════════════
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size    = mobile ? 100 : 116;
  const coverH  = mobile ? 190 : 230;
  const ringW   = 4;
  const bg      = isDark ? "#0f172a" : "#f8fafc";
  const cardBg  = isDark ? "#1e293b" : "#fff";
  const text    = isDark ? "#fff" : "#0f172a";
  const sub     = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const placement = profile?.avatar_placement || "center_overlap";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Cover — NO overflow:hidden on this wrapper */}
      <CoverImage profile={profile} height={coverH} color={color}>
        {profile?.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 3,
            width: 44, height: 44, borderRadius: 10, background: "#fff",
            padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
      </CoverImage>

      {/* Avatar — sibling of cover, zIndex 20 */}
      <AvatarLayer
        profile={profile} size={size}
        ringColor={cardBg} ringWidth={ringW}
        shadow={`0 0 0 3px ${hexRgb(color, 0.18)}, 0 16px 48px rgba(0,0,0,0.16)`}
        placement={placement}
      />

      {/* Identity */}
      <div style={{ textAlign: "center", padding: mobile ? "10px 20px 0" : "14px 36px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 27, fontWeight: 900, color: text, lineHeight: 1.1 }}>
          {profile?.display_name}
        </h1>
        {profile?.job_title && (
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color }}>{profile.job_title}</p>
        )}
        {profile?.company_name && (
          <p style={{ margin: "0 0 14px", fontSize: 13, color: sub, fontWeight: 600 }}>{profile.company_name}</p>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: mobile ? "10px 16px 120px" : "14px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. MINIMAL — left accent stripe, horizontal compact header
// ═══════════════════════════════════════════════════════════
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
      {/* Slim cover strip */}
      {profile?.cover_photo && (
        <div style={{ height: 60, position: "relative" }}>
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.6)}, transparent)` }} />
        </div>
      )}

      {/* Header card */}
      <div style={{ background: bg, borderLeft: `5px solid ${color}`, boxShadow: isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: mobile ? "20px 18px" : "24px 32px", borderBottom: `1px solid ${border}` }}>
          <div style={{ flexShrink: 0, border: `2.5px solid ${hexRgb(color, 0.25)}`, borderRadius: `calc(${radius} + 2.5px)` }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 18 : 22, fontWeight: 900, color: text }}>{profile?.display_name}</h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 28px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. DARK PREMIUM — cinematic dark bg, glow cover, gradient ring avatar
// ═══════════════════════════════════════════════════════════
export function DarkPremiumLayout({ profile, color, isDark: _isDark, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const coverH = mobile ? 175 : 220;
  const ringW  = 3;

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh" }}>
      {/* Cover */}
      <div style={{ height: coverH, position: "relative", background: "linear-gradient(155deg, #0f1a2e, #0a0f1e)" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center",
              opacity: 0.28, mixBlendMode: "luminosity" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 25%, #0a0f1e 100%)" }} />
        {/* Glow blob */}
        <div style={{ position: "absolute", bottom: -50, left: "50%", transform: "translateX(-50%)",
          width: 220, height: 90, background: color, filter: "blur(70px)", opacity: 0.25 }} />
      </div>

      {/* Avatar — sibling, zIndex 20, gradient ring */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 20,
        marginTop: -((size + ringW * 2) * 0.5) }}>
        <div style={{
          padding: ringW,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.3)})`,
          borderRadius: `calc(${radius} + ${ringW}px)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 16px 56px ${hexRgb(color, 0.45)}`,
        }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>
      </div>

      {/* Identity */}
      <div style={{ textAlign: "center", padding: mobile ? "14px 20px 0" : "18px 36px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 23 : 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
          {profile?.display_name}
        </h1>
        {profile?.job_title && (
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {profile.job_title}
          </p>
        )}
        {profile?.company_name && (
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{profile.company_name}</p>
        )}
        <div style={{ width: 52, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "14px auto 0" }} />
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. BOLD / COLOR GRADIENT — vivid full-color header, wave divider
// ═══════════════════════════════════════════════════════════
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 106 : 126;
  const radius = getAvatarRadius(profile?.avatar_shape);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Color hero — overflow:hidden only clips the photo tint, avatar is OUTSIDE */}
      <div style={{
        padding: mobile ? "44px 20px 0" : "60px 40px 0",
        background: `linear-gradient(150deg, ${color} 0%, ${hexRgb(color, 0.75)} 55%, ${hexRgb(color, 0.45)} 100%)`,
        position: "relative",
        textAlign: "center",
      }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.18, mixBlendMode: "overlay", pointerEvents: "none" }} />
        )}
        {profile?.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40,
            borderRadius: 8, background: "rgba(255,255,255,0.88)", padding: 4, overflow: "hidden", zIndex: 2 }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Avatar inside color hero — no cover edge to escape, overflow:hidden is OK on parent */}
        <div style={{ position: "relative", zIndex: 3 }}>
          <div style={{ display: "inline-block", padding: 5,
            background: "rgba(255,255,255,0.28)", backdropFilter: "blur(8px)",
            borderRadius: `calc(${radius} + 5px)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.22)", marginBottom: 16 }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 25 : 29, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{profile.company_name}</p>}
        </div>

        {/* Wave */}
        <div style={{ height: 40, position: "relative", overflow: "hidden", marginTop: -4 }}>
          <svg viewBox="0 0 400 40" preserveAspectRatio="none"
            style={{ position: "absolute", bottom: 0, width: "100%", height: 40 }}>
            <path d="M0,20 C100,40 300,0 400,20 L400,40 L0,40 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      <div style={{ padding: mobile ? "10px 16px 120px" : "14px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. SPLIT / MODERN SAAS — horizontal header card, accent top bar
// ═══════════════════════════════════════════════════════════
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
      {/* Gradient accent bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.35)})` }} />

      {/* Optional slim cover */}
      {profile?.cover_photo && (
        <div style={{ height: 90, position: "relative", overflow: "hidden" }}>
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.5)}, transparent)` }} />
        </div>
      )}

      {/* Horizontal header */}
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
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 19 : 23, fontWeight: 900, color: text, lineHeight: 1.1 }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>
        {profile?.company_logo && (
          <img src={profile.company_logo} alt=""
            style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0,
              borderRadius: 8, border: `1px solid ${border}` }} />
        )}
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. GLASS CARD — frosted glass on color gradient background
// ═══════════════════════════════════════════════════════════
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const radius = getAvatarRadius(profile?.avatar_shape);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.5)} 50%, #c7d2fe 100%)` }}>
      {/* Glass header — avatar lives INSIDE (no cover to escape) */}
      <div style={{
        padding: mobile ? "48px 20px 40px" : "64px 40px 48px",
        background: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(36px)",
        WebkitBackdropFilter: "blur(36px)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden", // safe: avatar is inside, not escaping
      }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.1, pointerEvents: "none" }} />
        )}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {/* Frosted ring around avatar */}
          <div style={{
            padding: 5,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderRadius: `calc(${radius} + 5px)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(255,255,255,0.6)",
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div style={{ padding: "14px 24px", borderRadius: 18,
            background: "rgba(255,255,255,0.58)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.8)" }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: hexRgb(color, 0.95) }}>{profile.job_title}</p>}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(15,23,42,0.55)" }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
        padding: mobile ? "18px 16px 120px" : "22px 32px 80px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 7. GRADIENT / AURORA — mesh gradient bg, centered portrait avatar
// ═══════════════════════════════════════════════════════════
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 130 : 158;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const coverH = mobile ? 120 : 140;
  const ringW  = 5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* Avatar — sibling, centered, large */}
      <AvatarLayer
        profile={profile} size={size}
        ringColor={cardBg} ringWidth={ringW}
        shadow={`0 0 0 4px ${hexRgb(color, 0.25)}, 0 24px 64px ${hexRgb(color, 0.3)}`}
        placement="center_overlap"
      />

      <div style={{ textAlign: "center", padding: mobile ? "16px 20px 0" : "20px 44px 0", position: "relative", zIndex: 5 }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: text, lineHeight: 1.1 }}>
          {profile?.display_name}
        </h1>
        {profile?.job_title && <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color }}>{profile.job_title}</p>}
        {profile?.company_name && <p style={{ margin: "0 0 18px", fontSize: 13, color: sub }}>{profile.company_name}</p>}
      </div>

      <div style={{ padding: mobile ? "6px 16px 120px" : "10px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 8. NEO / NEON — dark bg, vivid neon glow, no-cover full dark header
// ═══════════════════════════════════════════════════════════
export function NeonLayout({ profile, color, isDark: _isDark, mobile, contentSections }) {
  const size   = mobile ? 88 : 108;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const neon   = color || "#00ffcc";

  return (
    <div style={{ background: "#060912", minHeight: "100vh" }}>
      {/* Glowing header */}
      <div style={{
        padding: mobile ? "52px 20px 40px" : "68px 40px 52px",
        background: "linear-gradient(175deg, #0c0e1e, #060912)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${hexRgb(neon, 0.2)}`,
      }}>
        {/* Scan-line overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)", pointerEvents: "none" }} />
        {/* Glow orb */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 300, height: 150, background: neon, filter: "blur(90px)", opacity: 0.12 }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Neon ring */}
          <div style={{
            padding: 3,
            borderRadius: `calc(${radius} + 3px)`,
            boxShadow: `0 0 0 1.5px ${neon}, 0 0 20px ${hexRgb(neon, 0.55)}, 0 0 60px ${hexRgb(neon, 0.2)}`,
            background: "#0c0e1e",
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#fff",
              textShadow: `0 0 20px ${hexRgb(neon, 0.5)}` }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && (
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: neon,
                letterSpacing: "0.1em", textTransform: "uppercase",
                textShadow: `0 0 12px ${hexRgb(neon, 0.7)}` }}>
                {profile.job_title}
              </p>
            )}
            {profile?.company_name && (
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{profile.company_name}</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 9. RETRO / MAGAZINE — paper texture feel, serif-style header, warm tones
// ═══════════════════════════════════════════════════════════
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
      {/* Header band */}
      <div style={{
        background: cardBg,
        borderBottom: `3px double ${hexRgb(accent, 0.5)}`,
        padding: mobile ? "28px 18px 20px" : "36px 36px 24px",
        position: "relative",
      }}>
        {/* Decorative top rule */}
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
              fontVariant: "small-caps", letterSpacing: "0.02em" }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && (
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {profile.job_title}
              </p>
            )}
            {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 10. EXECUTIVE — right-aligned avatar, full cover, left name block
// ═══════════════════════════════════════════════════════════
export function ExecutiveLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 96 : 116;
  const bg     = isDark ? "#0f172a" : "#fff";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const coverH = mobile ? 200 : 260;
  const ringW  = 4;
  const pullUp = (size + ringW * 2) * 0.5;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* AvatarLayer + NameLayer flex row — both overlap cover */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        padding: mobile ? "0 18px" : "0 36px",
        marginTop: -pullUp,
        position: "relative",
        zIndex: 20,
      }}>
        <div style={{ flex: 1, paddingBottom: 6, paddingTop: size * 0.6 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 25, fontWeight: 900, color: text, lineHeight: 1.1 }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 12, color: sub, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>
        <AvatarRing profile={profile} size={size} ringColor={bg} ringWidth={ringW}
          shadow={`0 0 0 3px ${hexRgb(color, 0.2)}, 0 16px 48px rgba(0,0,0,0.2)`} />
      </div>

      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.2)} 70%, transparent)`, margin: "16px 0 0" }} />
      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 11. IMAGE HERO — full-bleed cover, avatar bottom-right, name on gradient
// Avatar placed OUTSIDE inner overflow:hidden clip div
// ═══════════════════════════════════════════════════════════
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size       = mobile ? 84 : 100;
  const radius     = getAvatarRadius(profile?.avatar_shape);
  const ringW      = 4;
  const heroH      = mobile ? 300 : 400;
  const totalRing  = size + ringW * 2;

  if (!profile?.cover_photo) {
    return <ClassicLayout profile={profile} color={color} isDark={isDark} mobile={mobile} contentSections={contentSections} />;
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/*
        Outer wrapper: height = heroH + half avatar height.
        NO overflow:hidden — avatar sits in the lower half.
      */}
      <div style={{ position: "relative", height: heroH + totalRing / 2 }}>
        {/* Inner image clip — ONLY clips the image */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: heroH, overflow: "hidden" }}>
          <img src={profile.cover_photo} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile?.cover_position || "center" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
            background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)" }} />
          {profile?.company_logo && (
            <div style={{ position: "absolute", top: 14, left: 14, width: 44, height: 44, zIndex: 2,
              borderRadius: 10, background: "rgba(255,255,255,0.9)", padding: 4, overflow: "hidden", backdropFilter: "blur(8px)" }}>
              <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
          {/* Name over gradient */}
          <div style={{ position: "absolute", bottom: totalRing / 2 + 14, left: 0, right: size + 44,
            padding: mobile ? "0 18px" : "0 28px", zIndex: 3 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 28, fontWeight: 900, color: "#fff",
              textShadow: "0 2px 14px rgba(0,0,0,0.55)", lineHeight: 1.1 }}>
              {profile?.display_name}
            </h1>
            {profile?.job_title && (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{profile.job_title}</p>
            )}
          </div>
        </div>

        {/* Avatar — on outer wrapper (NOT inside the clip div), zIndex 20 */}
        <div style={{ position: "absolute", bottom: 0, right: mobile ? 18 : 28, zIndex: 20 }}>
          <div style={{
            padding: ringW,
            background: "#fff",
            borderRadius: `calc(${radius} + ${ringW}px)`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          }}>
            <AvatarRenderer profile={profile} size={size} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 10 }}>
        {profile?.company_name && (
          <p style={{ textAlign: "right", paddingRight: mobile ? 18 : 28, paddingBottom: 4,
            fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            {profile.company_name}
          </p>
        )}
        <div style={{ padding: mobile ? "0 16px 120px" : "0 28px 80px" }}>{contentSections}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 12. CARD COMPACT — slim color strip, floating white card
// Avatar inside the floating card (not escaping a cover strip)
// ═══════════════════════════════════════════════════════════
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size   = mobile ? 60 : 72;
  const radius = getAvatarRadius(profile?.avatar_shape);
  const bg     = isDark ? "#1e293b" : "#fff";
  const outerBg= isDark ? "#0f172a" : "#f1f5f9";
  const text   = isDark ? "#fff" : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      {/* Color strip — avatar is NOT overlapping this strip; it lives in the card below */}
      <div style={{ height: mobile ? 90 : 110,
        background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`,
        position: "relative" }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.55 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${hexRgb(color, 0.5)}, transparent)` }} />
      </div>

      {/* Floating card — overlaps strip, avatar inside */}
      <div style={{
        background: bg,
        margin: mobile ? "0 12px" : "0 20px",
        borderRadius: 20,
        marginTop: -28,
        position: "relative",
        zIndex: 5,
        padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
      }}>
        <div style={{ flexShrink: 0, padding: 2.5,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.48)})`,
          borderRadius: `calc(${radius} + 2.5px)` }}>
          <AvatarRenderer profile={profile} size={size} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 16 : 19, fontWeight: 900, color: text, lineHeight: 1.1 }}>
            {profile?.display_name}
          </h1>
          {profile?.job_title && <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile?.company_name && <p style={{ margin: 0, fontSize: 11, color: sub }}>{profile.company_name}</p>}
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 16px 120px" : "18px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}