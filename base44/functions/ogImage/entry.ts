import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Generates a dynamic Open Graph image as SVG for a given profile username.
// Usage: /api/functions/ogImage?username=johndoe
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const username = url.searchParams.get("username") || body.username;

    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    // Fetch profile via service role
    const profiles = await base44.asServiceRole.entities.Profile.filter(
      { username, is_active: true }, '-updated_date', 1
    );
    const profile = profiles?.[0];

    // Fallback values for missing/unknown profiles
    const name = profile?.display_name || "Bingoo Connect";
    const jobTitle = profile?.job_title || "";
    const company = profile?.company_name || "";
    // Official Bingoo Connect brand logo — never use personal/profile photos in public brand images
    const BINGOO_LOGO_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png';
    const color = profile?.cover_color || "#0B2E6B";

    // Subtitle line
    const subtitle = [jobTitle, company].filter(Boolean).join(" • ");

    // Build SVG OG image (1200×630)
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0B2E6B;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.12" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.04" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="220" cy="290" r="110" />
    </clipPath>
    <clipPath id="avatarClipBorder">
      <circle cx="220" cy="290" r="120" />
    </clipPath>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="rgba(0,0,0,0.3)" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Dot pattern overlay -->
  <pattern id="dots" patternUnits="userSpaceOnUse" width="30" height="30">
    <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.08)" />
  </pattern>
  <rect width="1200" height="630" fill="url(#dots)" />

  <!-- Card panel -->
  <rect x="60" y="60" width="1080" height="510" rx="32" fill="url(#cardBg)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" filter="url(#shadow)" />

  <!-- Bingoo branding top-left -->
  <text x="110" y="130" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="900" fill="rgba(255,255,255,0.9)" letter-spacing="0.5">BINGOO CONNECT</text>
  <text x="110" y="155" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="500" fill="rgba(255,255,255,0.5)">bingooconnect.com</text>

  <!-- Verified Pro badge -->
  ${profile?.plan !== "free" ? `
  <rect x="960" y="105" width="140" height="36" rx="18" fill="rgba(253,186,33,0.25)" stroke="#FDBA21" stroke-width="1.5" />
  <text x="1030" y="128" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="900" fill="#FDBA21" text-anchor="middle" letter-spacing="1">✦ VERIFIED PRO</text>
  ` : ""}

  <!-- Avatar circle border -->
  <circle cx="220" cy="310" r="118" fill="rgba(255,255,255,0.25)" />
  <circle cx="220" cy="310" r="112" fill="${color}" />
  <image href="${BINGOO_LOGO_URL}" x="120" y="210" width="200" height="200" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid meet" />

  <!-- Name -->
  <text x="400" y="280" font-family="system-ui,-apple-system,sans-serif" font-size="58" font-weight="900" fill="#ffffff" letter-spacing="-1">${name.length > 22 ? name.slice(0, 22) + "…" : name}</text>

  <!-- Subtitle -->
  ${subtitle ? `<text x="400" y="338" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="600" fill="rgba(255,255,255,0.72)">${subtitle.length > 50 ? subtitle.slice(0, 50) + "…" : subtitle}</text>` : ""}

  <!-- Profile URL pill -->
  <rect x="400" y="380" width="${Math.min(username.length * 14 + 80, 500)}" height="48" rx="24" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="${400 + Math.min(username.length * 14 + 80, 500) / 2}" y="412" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="700" fill="rgba(255,255,255,0.9)" text-anchor="middle">bingooconnect.com/p/${username}</text>

  <!-- NFC chip icon bottom-right -->
  <text x="1075" y="530" font-family="system-ui,-apple-system,sans-serif" font-size="44" text-anchor="middle">📲</text>

  <!-- Divider line -->
  <line x1="110" y1="480" x2="900" y2="480" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  <text x="110" y="505" font-family="system-ui,-apple-system,sans-serif" font-size="16" fill="rgba(255,255,255,0.45)" font-weight="500">One tap to connect • NFC Digital Business Card</text>
</svg>`;

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("OG image error:", error.message);
    return new Response("Error generating image", { status: 500 });
  }
});