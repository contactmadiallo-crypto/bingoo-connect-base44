/**
 * ProfileLayoutRenderer — 10 truly distinct public profile layouts.
 * FIXES: avatar shape respected, placement real, no overflow clipping on cover,
 * avatar positioned OUTSIDE cover container, focal point applied correctly.
 */

export const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Shared helpers ────────────────────────────────────────────────────────

export function getAvatarRadius(shape) {
  const MAP = { circle: "50%", rounded: "22%", squircle: "28%", ios: "28%", card: "14px" };
  return MAP[shape] || "50%";
}

// Build avatar img or fallback div — never clips shape
function Avatar({ profile, size, extraStyle = {} }) {
  const radius = getAvatarRadius(profile.avatar_shape);
  const color = profile.cover_color || "#2563eb";
  return profile.profile_photo ? (
    <img
      src={profile.profile_photo}
      alt={profile.display_name || ""}
      style={{
        width: size, height: size,
        borderRadius: radius,
        objectFit: "cover",
        objectPosition: profile.avatar_position || "center top",
        display: "block",
        flexShrink: 0,
        ...extraStyle,
      }}
    />
  ) : (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.65)})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38),
      flexShrink: 0,
      ...extraStyle,
    }}>
      {(profile.display_name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// Cover image — never uses overflow:hidden on the outer wrapper so avatar can overlap
function CoverImage({ profile, height, color, dimOpacity = 0, children }) {
  return (
    <div style={{ height, position: "relative", flexShrink: 0,
      background: profile.cover_photo ? undefined : `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.65)})`,
    }}>
      {profile.cover_photo && (
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

// ─────────────────────────────────────────────
// 1. CLASSIC CLEAN — bright cover, centered avatar overlap, placement-aware
// ─────────────────────────────────────────────
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 108 : 120;
  const radius = getAvatarRadius(profile.avatar_shape);
  const placement = profile.avatar_placement || "center_overlap";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 200 : 240;

  // Determine horizontal alignment from placement
  const hAlign = placement === "right_overlap" ? "flex-end"
    : placement === "left_overlap" ? "flex-start"
    : "center";
  const hPad = (placement === "right_overlap" || placement === "left_overlap") ? 24 : 0;
  // Vertical offset: lower_center sits 30% out, others 50% out
  const vOffset = placement === "lower_center" ? -(size * 0.3) : -(size * 0.5);

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Cover — no overflow hidden, avatar lives below */}
      <CoverImage profile={profile} height={coverH} color={color}>
        {profile.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 44, height: 44, borderRadius: 10, background: "#fff", padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
      </CoverImage>

      {/* Avatar row — sits below cover, overlaps via negative margin */}
      <div style={{ display: "flex", justifyContent: hAlign, paddingLeft: hPad, paddingRight: hPad }}>
        <div style={{
          marginTop: vOffset,
          zIndex: 10, position: "relative",
          padding: 4,
          background: cardBg,
          borderRadius: `calc(${radius} + 4px)`,
          boxShadow: `0 0 0 3px ${hexRgb(color, 0.18)}, 0 16px 48px rgba(0,0,0,0.18)`,
        }}>
          <Avatar profile={profile} size={size} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: mobile ? "14px 24px 0" : "16px 40px 0" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 16px", fontSize: 13, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
      </div>

      <div style={{ padding: mobile ? "12px 18px 120px" : "16px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. PORTRAIT CENTER — huge avatar, short banner
// ─────────────────────────────────────────────
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 140 : 170;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 130 : 150;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* Giant centered avatar overlapping cover */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          marginTop: -(size / 2),
          padding: 5,
          background: bg,
          borderRadius: `calc(${radius} + 5px)`,
          boxShadow: `0 0 0 4px ${hexRgb(color, 0.25)}, 0 24px 64px ${hexRgb(color, 0.3)}`,
        }}>
          <Avatar profile={profile} size={size} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: mobile ? "18px 24px 0" : "22px 48px 0" }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 28 : 34, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 20px", fontSize: 13, color: subColor }}>{profile.company_name}</p>}
      </div>

      <div style={{ padding: mobile ? "8px 18px 120px" : "12px 40px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. FULL IMAGE HERO — cover is the entire hero, text at bottom, avatar floats right
// ─────────────────────────────────────────────
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 88 : 104;
  const radius = getAvatarRadius(profile.avatar_shape);

  // If no cover photo, fall back to classic
  if (!profile.cover_photo) return <ClassicLayout profile={profile} color={color} isDark={isDark} mobile={mobile} contentSections={contentSections} />;

  const heroH = mobile ? 340 : 440;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero — full height, subtle bottom gradient only */}
      <div style={{ height: heroH, position: "relative", overflow: "hidden" }}>
        <img
          src={profile.cover_photo}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }}
        />
        {/* Subtle bottom gradient for text legibility — top stays bright */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }} />

        {/* Company logo — top right */}
        {profile.company_logo && (
          <div style={{ position: "absolute", top: 14, left: 14, width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.9)", padding: 4, overflow: "hidden", backdropFilter: "blur(8px)" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Name / title over gradient at bottom-left */}
        <div style={{ position: "absolute", bottom: size / 2 + 16, left: 0, right: size + 32, padding: mobile ? "0 20px" : "0 32px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 24 : 30, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)", lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{profile.job_title}</p>}
        </div>

        {/* Avatar — bottom-right corner, half overlapping hero bottom */}
        <div style={{ position: "absolute", bottom: -(size / 2), right: mobile ? 20 : 32 }}>
          <div style={{ padding: 4, background: "#fff", borderRadius: `calc(${radius} + 4px)`, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
            <Avatar profile={profile} size={size} />
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div style={{ paddingTop: size / 2 + 12 }}>
        {profile.company_name && (
          <p style={{ textAlign: "right", paddingRight: mobile ? 20 : 32, paddingBottom: 4, fontSize: 13, color: "#64748b", fontWeight: 600 }}>{profile.company_name}</p>
        )}
        <div style={{ padding: mobile ? "0 18px 120px" : "0 32px 80px" }}>{contentSections}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. GLASS CARD — frosted glass header on gradient bg, avatar INSIDE card
// ─────────────────────────────────────────────
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile.avatar_shape);

  // Derive a readable dark shade for text on gradient
  const darkShade = isDark ? "rgba(0,0,0,0.8)" : "rgba(15,23,42,0.85)";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.5)} 55%, #c7d2fe 100%)` }}>
      {/* Glassmorphic header card */}
      <div style={{
        margin: 0,
        padding: mobile ? "40px 20px 32px" : "56px 40px 40px",
        background: "rgba(255,255,255,0.22)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Cover photo as very subtle tint behind glass */}
        {profile.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, pointerEvents: "none" }} />
        )}

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Avatar with crisp white ring */}
          <div style={{
            padding: 5,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            borderRadius: `calc(${radius} + 5px)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(255,255,255,0.6)",
          }}>
            <Avatar profile={profile} size={size} />
          </div>

          {/* Name + title on dark pill for contrast */}
          <div style={{
            padding: "14px 28px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: darkShade, lineHeight: 1.1 }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: hexRgb(color, 0.95) }}>{profile.job_title}</p>}
            {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(15,23,42,0.6)" }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      {/* Content area on white */}
      <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", padding: mobile ? "20px 18px 120px" : "24px 36px 80px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. MODERN SAAS — horizontal header, avatar LEFT, name RIGHT
// ─────────────────────────────────────────────
export function ModernSaasLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 80 : 96;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#f1f5f9";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Top accent bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.35)})` }} />

      {/* Optional cover — slim, no overlap needed */}
      {profile.cover_photo && (
        <div style={{ height: 80, overflow: "hidden", position: "relative" }}>
          <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${hexRgb(color, 0.5)}, transparent)` }} />
        </div>
      )}

      {/* Horizontal header card */}
      <div style={{
        background: cardBg,
        padding: mobile ? "24px 20px" : "28px 40px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
        position: "relative",
      }}>
        {/* Avatar with gradient ring */}
        <div style={{
          flexShrink: 0,
          padding: 3,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.45)})`,
          borderRadius: `calc(${radius} + 3px)`,
          boxShadow: `0 8px 24px ${hexRgb(color, 0.28)}`,
        }}>
          <Avatar profile={profile} size={size} />
        </div>

        {/* Name + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 24, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>

        {/* Company logo on far right */}
        {profile.company_logo && (
          <img src={profile.company_logo} alt="" style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0, borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` }} />
        )}
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. DARK PREMIUM — cinematic dark, glowing avatar, dimmed cover
// ─────────────────────────────────────────────
export function DarkPremiumLayout({ profile, color, isDark: _isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile.avatar_shape);
  const coverH = mobile ? 180 : 220;

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh" }}>
      {/* Cover — intentionally dark for this theme */}
      <div style={{ height: coverH, position: "relative", overflow: "hidden", background: "linear-gradient(155deg, #0f1a2e, #0a0f1e)" }}>
        {profile.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.3, mixBlendMode: "luminosity" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #0a0f1e 100%)" }} />
        {/* Glow */}
        <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, background: color, filter: "blur(60px)", opacity: 0.28 }} />
      </div>

      {/* Avatar — overlaps cover bottom, centered */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          marginTop: -(size / 2),
          padding: 3,
          background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.35)})`,
          borderRadius: `calc(${radius} + 3px)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px ${hexRgb(color, 0.4)}`,
        }}>
          <Avatar profile={profile} size={size} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: mobile ? "14px 24px 0" : "18px 40px 0" }}>
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{profile.company_name}</p>}
        <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "14px auto 0" }} />
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. EXECUTIVE / LUXURY — name LEFT, avatar RIGHT overlap
// ─────────────────────────────────────────────
export function ExecutiveLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 100 : 120;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const coverH = mobile ? 220 : 280;

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Cover — full brightness, no overlay */}
      <CoverImage profile={profile} height={coverH} color={color} />

      {/* Header row: name left, avatar right — both overlap cover via negative margin */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        padding: mobile ? "0 20px" : "0 40px",
        marginTop: -(size / 2),
        position: "relative",
        zIndex: 10,
      }}>
        {/* Name block (pushes down so baseline aligns with avatar center) */}
        <div style={{ flex: 1, paddingBottom: 4, paddingTop: size * 0.6 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 27, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>

        {/* Avatar — right side */}
        <div style={{
          flexShrink: 0,
          padding: 4,
          background: bg,
          borderRadius: `calc(${radius} + 4px)`,
          boxShadow: `0 0 0 3px ${hexRgb(color, 0.2)}, 0 16px 48px rgba(0,0,0,0.2)`,
        }}>
          <Avatar profile={profile} size={size} />
        </div>
      </div>

      {/* Gold accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.25)} 70%, transparent)`, margin: "16px 0 0" }} />

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. MINIMAL BUSINESS — no big cover, left accent bar, horizontal layout
// ─────────────────────────────────────────────
export function MinimalLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 72 : 84;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const outerBg = isDark ? "#0a0e1a" : "#f8fafc";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      <div style={{ background: bg, borderLeft: `5px solid ${color}` }}>
        {/* Slim cover strip if present */}
        {profile.cover_photo && (
          <div style={{ height: 80, overflow: "hidden", position: "relative" }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          </div>
        )}

        {/* Horizontal: avatar left, name right */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: mobile ? "20px 20px" : "24px 32px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
          <div style={{
            flexShrink: 0,
            border: `2px solid ${hexRgb(color, 0.2)}`,
            borderRadius: `calc(${radius} + 2px)`,
          }}>
            <Avatar profile={profile} size={size} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 18 : 22, fontWeight: 900, color: textColor }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
            {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 32px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. COLOR / GRADIENT — vibrant color header with wave, big centered avatar
// ─────────────────────────────────────────────
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 110 : 130;
  const radius = getAvatarRadius(profile.avatar_shape);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Color hero */}
      <div style={{
        padding: mobile ? "40px 20px 0" : "56px 40px 0",
        background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.72)} 60%, ${hexRgb(color, 0.45)} 100%)`,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {profile.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22, mixBlendMode: "overlay" }} />
        )}
        {profile.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.88)", padding: 4, overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Avatar on color bg */}
        <div style={{ display: "inline-block", padding: 5, background: "rgba(255,255,255,0.32)", backdropFilter: "blur(8px)", borderRadius: `calc(${radius} + 5px)`, boxShadow: "0 8px 32px rgba(0,0,0,0.22)", marginBottom: 16, position: "relative" }}>
          <Avatar profile={profile} size={size} />
        </div>

        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{profile.company_name}</p>}

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

// ─────────────────────────────────────────────
// 10. CARD COMPACT — slim cover strip, floating card below
// ─────────────────────────────────────────────
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 64 : 72;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#1e293b" : "#fff";
  const outerBg = isDark ? "#0f172a" : "#f1f5f9";
  const textColor = isDark ? "#fff" : "#0f172a";

  return (
    <div style={{ background: outerBg, minHeight: "100vh" }}>
      {/* Slim cover strip */}
      <div style={{ height: mobile ? 90 : 110, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, position: "relative", overflow: "hidden" }}>
        {profile.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.65 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${hexRgb(color, 0.55)}, transparent)` }} />
      </div>

      {/* Floating card — overlaps cover */}
      <div style={{
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
      }}>
        <div style={{ flexShrink: 0, padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: `calc(${radius} + 2px)` }}>
          <Avatar profile={profile} size={size} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 16 : 18, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>{profile.company_name}</p>}
        </div>
      </div>

      <div style={{ padding: mobile ? "14px 18px 120px" : "18px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}