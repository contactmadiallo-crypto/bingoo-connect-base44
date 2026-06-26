/**
 * Real profile layout renderer — produces visibly different public profile output
 * based on selected layout type (not just size changes).
 */

import { motion } from "framer-motion";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function getAvatarRadius(shape) {
  const AVATAR_RADIUS = { circle: "50%", rounded: "20%", squircle: "28%", card: "12px" };
  return AVATAR_RADIUS[shape] || "50%";
}

/**
 * Classic — cover + overlay + centered avatar
 */
export function ClassicLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 110 : 128;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden" }}>
      <div style={{ height: mobile ? 220 : 280, position: "relative", background: `linear-gradient(155deg, ${color} 0%, ${hexRgb(color, 0.85)} 40%, #0B2E6B 100%)`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="Cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, transparent, ${isDark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.15)"})` }} />
      </div>
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -58 : -70, padding: mobile ? "14px 24px 0" : "18px 40px 0" }}>
        <div style={{ padding: 4, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius, boxShadow: `0 0 0 5px #fff, 0 20px 60px ${hexRgb(color, 0.45)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.4) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <h1 style={{ margin: "12px 0 5px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: isDark ? "#fff" : "#0f172a", lineHeight: 1.1 }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 14.5, fontWeight: 700, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.65)})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 14px", fontSize: 13, color: isDark ? "rgba(255,255,255,0.38)" : "#64748b", fontWeight: 600 }}>{profile.company_name}</p>}
      </div>
      <div style={{ padding: mobile ? "20px 18px 40px" : "24px 32px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Glassmorphic — frosted glass panels on gradient
 */
export function GlassLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 100 : 120;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden", background: `linear-gradient(135deg, ${color}15, ${color}08, #fff5)` }}>
      <div style={{ height: mobile ? 200 : 240, position: "relative", background: `linear-gradient(155deg, ${color}, ${hexRgb(color, 0.7)})`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))` }} />
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: mobile ? "20px 16px 0" : "28px 32px 0", display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -50 : -60 }}>
        <div style={{ padding: 3, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius, boxShadow: `0 8px 32px ${hexRgb(color, 0.3)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <div style={{ marginTop: 16, padding: "18px 28px", borderRadius: 20, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.8)", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#0f172a" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: color }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{profile.company_name}</p>}
        </div>
      </div>
      <div style={{ padding: mobile ? "24px 16px 40px" : "32px 40px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Dark Premium — minimal dark mode
 */
export function DarkPremiumLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 90 : 100;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden", background: "#0f172a" }}>
      <div style={{ height: mobile ? 180 : 200, position: "relative", background: `linear-gradient(155deg, #1e293b, #0f172a)`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(15,23,42,0.9))" }} />
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: mobile ? "16px 20px 0" : "20px 36px 0", display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -45 : -50 }}>
        <div style={{ padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius, boxShadow: `0 8px 24px ${hexRgb(color, 0.25)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <h1 style={{ margin: "12px 0 3px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#fff", textAlign: "center" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
      </div>
      <div style={{ padding: mobile ? "18px 16px 40px" : "24px 32px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Color Pop — vibrant gradient, big avatar
 */
export function ColorLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 120 : 140;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden" }}>
      <div style={{ height: mobile ? 240 : 300, position: "relative", background: `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.5)} 50%, #fff 100%)`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />}
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: mobile ? "18px 20px 0" : "24px 36px 0", display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -60 : -80 }}>
        <div style={{ padding: 4, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: radius, boxShadow: `0 12px 40px ${hexRgb(color, 0.35)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <h1 style={{ margin: "16px 0 6px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: "#0f172a", textAlign: "center" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color, textAlign: "center" }}>{profile.job_title}</p>}
      </div>
      <div style={{ padding: mobile ? "28px 18px 40px" : "32px 40px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Minimal Business — compact, no-frills
 */
export function MinimalLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 70 : 80;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "20px 20px 0 0", overflow: "hidden", background: isDark ? "#0f172a" : "#f8fafc" }}>
      <div style={{ height: mobile ? 140 : 160, position: "relative", background: isDark ? "linear-gradient(135deg, #1e293b, #0f172a)" : `linear-gradient(135deg, ${hexRgb(color, 0.1)}, ${hexRgb(color, 0.05)})` }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />}
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: mobile ? "12px 16px 0" : "16px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -35 : -40 }}>
        <div style={{ padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <h1 style={{ margin: "8px 0 2px", fontSize: mobile ? 18 : 22, fontWeight: 900, color: isDark ? "#fff" : "#0f172a" }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>{profile.job_title}</p>}
      </div>
      <div style={{ padding: mobile ? "14px 12px 40px" : "18px 24px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Card Compact — minimal header, tight spacing
 */
export function CardLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 60 : 70;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "18px 18px 0 0", overflow: "hidden", background: isDark ? "#1e293b" : "#f8fafc" }}>
      <div style={{ height: mobile ? 100 : 120, position: "relative", background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />}
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: mobile ? "10px 14px 0" : "14px 20px 0", display: "flex", alignItems: "flex-end", gap: 12, marginTop: mobile ? -30 : -35 }}>
        <div style={{ padding: 2, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius, flexShrink: 0 }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <div style={{ paddingBottom: 4 }}>
          <h1 style={{ margin: "0 0 2px", fontSize: mobile ? 14 : 16, fontWeight: 900, color: isDark ? "#fff" : "#0f172a" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: color }}>{profile.job_title}</p>}
        </div>
      </div>
      <div style={{ padding: mobile ? "12px 12px 40px" : "16px 20px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Image Hero — full-bleed cover photo, minimal overlay text, avatar at bottom of hero
 */
export function ImageHeroLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 90 : 110;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  if (!profile.cover_photo) return <ClassicLayout profile={profile} color={color} isDark={isDark} mobile={mobile} contentSections={contentSections} />;
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden" }}>
      <div style={{ height: mobile ? 320 : 420, position: "relative", overflow: "hidden" }}>
        <img src={profile.cover_photo} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.65) 100%)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 3, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: radius, boxShadow: `0 0 0 3px rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.35)` }}>
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
              : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.35) }}>{profile.display_name?.charAt(0) || "?"}</div>
            }
          </div>
          <h1 style={{ margin: 0, fontSize: mobile ? 24 : 30, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)", textAlign: "center", padding: "0 24px" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.82)", fontWeight: 700 }}>{profile.job_title}</p>}
        </div>
      </div>
      <div style={{ padding: mobile ? "24px 16px 40px" : "32px 40px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}

/**
 * Portrait — large centered avatar, minimal cover, name below
 */
export function PortraitLayout({ profile, color, isDark, mobile, contentSections }) {
  const size = mobile ? 130 : 160;
  const radius = getAvatarRadius(profile.avatar_shape || "circle");
  return (
    <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden", background: isDark ? "#0f172a" : "#f8fafc" }}>
      <div style={{ height: mobile ? 140 : 160, position: "relative", background: `linear-gradient(155deg, ${color}, ${hexRgb(color, 0.6)})`, overflow: "hidden" }}>
        {profile.cover_photo && <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.5 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.3))" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -65 : -80, padding: mobile ? "0 24px" : "0 40px" }}>
        <div style={{ padding: 4, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.5)})`, borderRadius: radius, boxShadow: `0 0 0 5px ${isDark ? "#0f172a" : "#f8fafc"}, 0 20px 60px ${hexRgb(color, 0.4)}` }}>
          {profile.profile_photo
            ? <img src={profile.profile_photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", objectPosition: profile.avatar_position || "center top", display: "block" }} />
            : <div style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.38) }}>{profile.display_name?.charAt(0) || "?"}</div>
          }
        </div>
        <h1 style={{ margin: "18px 0 5px", fontSize: mobile ? 28 : 34, fontWeight: 900, color: isDark ? "#fff" : "#0f172a", textAlign: "center", lineHeight: 1.1 }}>{profile.display_name}</h1>
        {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color, textAlign: "center" }}>{profile.job_title}</p>}
        {profile.company_name && <p style={{ margin: "0 0 20px", fontSize: 13, color: isDark ? "rgba(255,255,255,0.4)" : "#64748b", fontWeight: 600, textAlign: "center" }}>{profile.company_name}</p>}
      </div>
      <div style={{ padding: mobile ? "8px 18px 40px" : "12px 40px 48px" }}>
        {contentSections}
      </div>
    </div>
  );
}