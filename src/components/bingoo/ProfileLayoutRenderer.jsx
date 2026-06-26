/**
 * ProfileLayoutRenderer — 10 truly distinct public profile layouts.
 * Each changes structure, avatar placement, cover treatment, and content flow.
 * No hardcoded dark overlays on cover unless the layout explicitly requires it.
 */

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function getAvatarRadius(shape) {
  const MAP = { circle: "50%", rounded: "22%", squircle: "28%", card: "14px" };
  return MAP[shape] || "50%";
}

// Avatar placement offsets — where does the avatar sit relative to the cover bottom?
function getAvatarPlacementStyle(placement, size) {
  // All positions are controlled via the container's alignment & margin
  switch (placement) {
    case "lower_center": return { alignSelf: "center", marginTop: -(size * 0.3) };
    case "right_overlap": return { alignSelf: "flex-end", marginRight: 24, marginTop: -(size * 0.5) };
    case "left_overlap":  return { alignSelf: "flex-start", marginLeft: 24, marginTop: -(size * 0.5) };
    case "floating_card": return { alignSelf: "center", marginTop: 20 };
    case "inside_card":   return { alignSelf: "center", marginTop: 0 };
    default:              return { alignSelf: "center", marginTop: -(size * 0.5) }; // center_overlap
  }
}

// ─────────────────────────────────────────────
// 1. CLASSIC CLEAN — bright cover, center overlap avatar
// ─────────────────────────────────────────────
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 108 : 120;
  const radius = getAvatarRadius(profile.avatar_shape);
  const placement = profile.avatar_placement || "center_overlap";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "rgba(15,23,42,0.97)" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Cover — full brightness, no dark overlay */}
      <div style={{ height: mobile ? 200 : 240, position: "relative", overflow: "hidden",
        background: profile.cover_photo ? undefined : `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})` }}>
        {profile.cover_photo && (
          <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        )}
        {/* Company logo badge */}
        {profile.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 44, height: 44, borderRadius: 10, background: "#fff", padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
      </div>

      {/* Avatar — overlapping cover, respects placement */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: placement === "right_overlap" ? "flex-end" : placement === "left_overlap" ? "flex-start" : "center", padding: placement === "right_overlap" ? "0 24px" : placement === "left_overlap" ? "0 24px" : "0" }}>
        <div style={{ zIndex: 10, marginTop: -(size / 2), position: "relative" }}>
          <div style={{ padding: 4, background: "#fff", borderRadius: `calc(${radius} + 4px)`, boxShadow: `0 0 0 3px ${color}22, 0 16px 48px rgba(0,0,0,0.18)` }}>
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
              : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
            }
          </div>
        </div>
      </div>

      {/* Name / title */}
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
// 2. PORTRAIT CENTER — huge avatar, banner behind
// ─────────────────────────────────────────────
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 140 : 170;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Short cover banner */}
      <div style={{ height: mobile ? 130 : 150, position: "relative", overflow: "hidden",
        background: profile.cover_photo ? undefined : `linear-gradient(160deg, ${color} 0%, ${hexRgb(color, 0.55)} 100%)` }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />}
        {/* Subtle bottom fade only for readability if cover photo exists */}
        {profile.cover_photo && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to bottom, transparent, ${bg})` }} />}
      </div>

      {/* Giant avatar centered */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -(size / 2) }}>
        <div style={{ padding: 5, background: bg, borderRadius: `calc(${radius} + 5px)`, boxShadow: `0 0 0 4px ${color}30, 0 24px 64px ${hexRgb(color, 0.35)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
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
// 3. FULL IMAGE HERO — cover is the hero, overlay name at bottom, avatar floats
// ─────────────────────────────────────────────
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 88 : 104;
  const radius = getAvatarRadius(profile.avatar_shape);

  if (!profile.cover_photo) return <ClassicLayout profile={profile} color={color} isDark={isDark} mobile={mobile} contentSections={contentSections} />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero — full height cover with gradient overlay only at bottom for text legibility */}
      <div style={{ height: mobile ? 340 : 440, position: "relative", overflow: "hidden" }}>
        <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        {/* Only bottom gradient — top stays bright */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }} />

        {/* Name overlay at bottom of hero */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mobile ? "20px 20px 90px" : "24px 40px 100px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.4)", lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{profile.job_title}</p>}
        </div>

        {/* Avatar floating above the hero bottom */}
        <div style={{ position: "absolute", bottom: -size / 2, right: mobile ? 20 : 40 }}>
          <div style={{ padding: 4, background: "#fff", borderRadius: `calc(${radius} + 4px)`, boxShadow: `0 12px 40px rgba(0,0,0,0.3)` }}>
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
              : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
            }
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div style={{ paddingTop: size / 2 + 16 }}>
        {profile.company_name && (
          <div style={{ textAlign: "right", paddingRight: mobile ? 20 : 40, paddingBottom: 8 }}>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{profile.company_name}</p>
          </div>
        )}
        <div style={{ padding: mobile ? "0 18px 120px" : "0 36px 80px" }}>{contentSections}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. GLASS CARD — frosted glass header on gradient backdrop
// ─────────────────────────────────────────────
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile.avatar_shape);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, ${color} 0%, ${hexRgb(color, 0.55)} 45%, #e0e7ff 100%)` }}>
      {/* Glass header card */}
      <div style={{ position: "relative", margin: mobile ? "0 0 0" : "0 0 0", padding: mobile ? "40px 20px 30px" : "56px 40px 36px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderBottom: "1px solid rgba(255,255,255,0.35)", textAlign: "center" }}>
        {/* Cover tint strip */}
        {profile.cover_photo && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 0 }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }} />
          </div>
        )}

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {/* Avatar with glass ring */}
          <div style={{ padding: 4, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderRadius: `calc(${radius} + 4px)`, boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)", marginBottom: 16 }}>
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
              : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
            }
          </div>

          {/* Frosted name card */}
          <div style={{ padding: "14px 28px", borderRadius: 18, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.75)", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{profile.job_title}</p>}
            {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{profile.company_name}</p>}
          </div>
        </div>
      </div>

      {/* Content on glass-tinted white */}
      <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", padding: mobile ? "20px 18px 120px" : "24px 36px 80px" }}>
        {contentSections}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. MODERN SAAS — horizontal avatar+name header, left-side accent
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
      <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.4)})` }} />

      {/* Horizontal header — avatar left, name right */}
      <div style={{ background: cardBg, padding: mobile ? "24px 20px" : "32px 40px", display: "flex", alignItems: "center", gap: 20, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
        {/* Cover photo strip on right */}
        {profile.cover_photo && (
          <div style={{ position: "absolute", right: 0, top: 5, width: mobile ? 80 : 120, bottom: 0, overflow: "hidden", opacity: 0.15 }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Avatar */}
        <div style={{ flexShrink: 0, padding: 3, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: `calc(${radius} + 3px)`, boxShadow: `0 8px 24px ${hexRgb(color, 0.3)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.4) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>

        {/* Name + title */}
        <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 24, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. DARK PREMIUM — cinematic dark, glowing accent
// ─────────────────────────────────────────────
export function DarkPremiumLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 96 : 112;
  const radius = getAvatarRadius(profile.avatar_shape);

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh" }}>
      {/* Dark cover — dimmed intentionally for this theme */}
      <div style={{ height: mobile ? 180 : 220, position: "relative", overflow: "hidden", background: `linear-gradient(155deg, #0f1a2e, #0a0f1e)` }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.35, mixBlendMode: "luminosity" }} />}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, #0a0f1e 100%)` }} />
        {/* Glow accent */}
        <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, background: color, filter: "blur(60px)", opacity: 0.3 }} />
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -(size / 2), paddingBottom: 4 }}>
        <div style={{ padding: 3, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.4)})`, borderRadius: `calc(${radius} + 3px)`, boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px ${hexRgb(color, 0.4)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>

        <div style={{ textAlign: "center", padding: mobile ? "14px 24px 0" : "18px 40px 0" }}>
          <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{profile.company_name}</p>}
        </div>

        {/* Divider accent line */}
        <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "14px 0 0" }} />
      </div>

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. EXECUTIVE / LUXURY — cover + right-side avatar, editorial header
// ─────────────────────────────────────────────
export function ExecutiveLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 100 : 120;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Full-width cover, NO overlay darkening */}
      <div style={{ height: mobile ? 220 : 280, position: "relative", overflow: "hidden",
        background: profile.cover_photo ? undefined : `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.6)} 100%)` }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />}
      </div>

      {/* Header row: name left, avatar right (overlapping cover) */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, padding: mobile ? "0 20px" : "0 40px", marginTop: -(size / 2), position: "relative", zIndex: 10 }}>
        {/* Name block */}
        <div style={{ flex: 1, paddingBottom: 4, paddingTop: size * 0.65 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 22 : 27, fontWeight: 900, color: textColor, lineHeight: 1.1 }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor, fontWeight: 600 }}>{profile.company_name}</p>}
        </div>

        {/* Avatar right-side overlap */}
        <div style={{ flexShrink: 0, padding: 4, background: bg, borderRadius: `calc(${radius} + 4px)`, boxShadow: `0 0 0 3px ${color}22, 0 16px 48px rgba(0,0,0,0.2)` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
      </div>

      {/* Gold accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.3)} 70%, transparent)`, margin: "16px 0 0" }} />

      <div style={{ padding: mobile ? "16px 18px 120px" : "20px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. MINIMAL BUSINESS — no cover, just clean white + left accent
// ─────────────────────────────────────────────
export function MinimalLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 72 : 84;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#0f172a" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <div style={{ background: isDark ? "#0f172a" : "#f8fafc", minHeight: "100vh" }}>
      <div style={{ background: bg, borderLeft: `5px solid ${color}`, margin: 0 }}>
        {/* If cover photo, show a slim banner */}
        {profile.cover_photo && (
          <div style={{ height: 80, overflow: "hidden", position: "relative" }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
          </div>
        )}

        {/* Header: avatar left, name right */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: mobile ? "20px 20px" : "24px 32px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
          <div style={{ flexShrink: 0, border: `2px solid ${color}22`, borderRadius: `calc(${radius} + 2px)` }}>
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
              : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.4) }}>{profile.display_name?.charAt(0) || "?"}</div>
            }
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
// 9. COLOR / GRADIENT — vibrant color header, big centered avatar
// ─────────────────────────────────────────────
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 110 : 130;
  const radius = getAvatarRadius(profile.avatar_shape);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Color hero header */}
      <div style={{ padding: mobile ? "40px 20px 0" : "56px 40px 0", background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.7)} 60%, ${hexRgb(color, 0.4)} 100%)`, position: "relative", overflow: "hidden", textAlign: "center" }}>
        {profile.cover_photo && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={profile.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25, mixBlendMode: "overlay" }} />
          </div>
        )}

        {profile.company_logo && (
          <div style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.9)", padding: 4, overflow: "hidden" }}>
            <img src={profile.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Avatar */}
        <div style={{ display: "inline-block", padding: 5, background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: `calc(${radius} + 5px)`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", marginBottom: 16, position: "relative" }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>

        {/* Name on colored background */}
        <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{profile.company_name}</p>}

        {/* Wave divider */}
        <div style={{ marginTop: 28, height: 32, position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 32 }}>
            <path d="M0,16 C100,32 300,0 400,16 L400,32 L0,32 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      <div style={{ padding: mobile ? "12px 18px 120px" : "16px 36px 80px" }}>{contentSections}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 10. CARD COMPACT — tight horizontal header
// ─────────────────────────────────────────────
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 64 : 72;
  const radius = getAvatarRadius(profile.avatar_shape);
  const bg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#fff" : "#0f172a";

  return (
    <div style={{ background: isDark ? "#0f172a" : "#f1f5f9", minHeight: "100vh" }}>
      {/* Slim cover strip */}
      <div style={{ height: mobile ? 90 : 110, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, position: "relative", overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.7 }} />}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${hexRgb(color, 0.6)}, transparent)` }} />
      </div>

      {/* Card header — avatar + name side by side, overlapping cover */}
      <div style={{ background: bg, margin: mobile ? "0 12px" : "0 24px", borderRadius: 20, marginTop: -28, position: "relative", zIndex: 5, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}>
        <div style={{ flexShrink: 0, padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: `calc(${radius} + 2px)` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.4) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
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