import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch active public profiles
    const profiles = await base44.asServiceRole.entities.Profile.filter(
      { is_active: true },
      '-updated_date',
      500
    );

    const BASE_URL = 'https://bingooconnect.com';
    const now = new Date().toISOString().split('T')[0];

    // ONLY truly public marketing/legal pages — NO authenticated or dashboard routes
    const staticPages = [
      { url: '/',               changefreq: 'weekly', priority: '1.0' },
      { url: '/about',          changefreq: 'monthly', priority: '0.7' },
      { url: '/contact',        changefreq: 'monthly', priority: '0.7' },
      { url: '/shop',           changefreq: 'weekly',  priority: '0.8' },
      { url: '/pricing',        changefreq: 'weekly',  priority: '0.8' },
      { url: '/privacy',        changefreq: 'yearly',  priority: '0.4' },
      { url: '/terms',          changefreq: 'yearly',  priority: '0.4' },
      { url: '/data-deletion',  changefreq: 'yearly',  priority: '0.3' },
      { url: '/contact-support',changefreq: 'monthly', priority: '0.5' },
    ];

    // Active public profile pages
    const profileUrls = (profiles || []).map(p => ({
      url: `/p/${p.username}`,
      changefreq: 'weekly',
      priority: '0.9',
      lastmod: p.updated_date ? p.updated_date.split('T')[0] : now,
    }));

    const allUrls = [...staticPages, ...profileUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${BASE_URL}${u.url}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[sitemapXml] error:', err.message);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
});