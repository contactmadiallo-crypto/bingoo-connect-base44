import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = "https://bingooconnect.com";

    // Fetch all active profiles using service role
    const profiles = await base44.asServiceRole.entities.Profile.filter(
      { is_active: true },
      "-updated_date",
      500
    );

    const staticPages = [
      { loc: baseUrl,                    priority: "1.0", changefreq: "weekly" },
      { loc: `${baseUrl}/pricing`,       priority: "0.9", changefreq: "monthly" },
      { loc: `${baseUrl}/about`,         priority: "0.8", changefreq: "monthly" },
      { loc: `${baseUrl}/contact`,       priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/privacy`,       priority: "0.5", changefreq: "yearly" },
      { loc: `${baseUrl}/terms`,         priority: "0.5", changefreq: "yearly" },
    ];

    const profileUrls = profiles.map(p => ({
      loc: `${baseUrl}/p/${p.username}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: p.updated_date ? new Date(p.updated_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }));

    const allUrls = [...staticPages, ...profileUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
  </url>`).join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error.message);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
});