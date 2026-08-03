import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

const WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const WALLET_SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const SAVE_URL_PREFIX = 'https://pay.google.com/gp/v/save/';
const PUBLIC_APP_ORIGIN = 'https://bingooconnect.com';

// Official Bingoo Connect commercial brand logo — used as the pass issuer logo.
// Never use personal photos or user profile photos as the brand logo.
const BINGOO_LOGO_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png';

// Premium Bingoo brand accent — navy card (the only pass-level color Google Wallet supports)
const BINGOO_NAVY = '#0B2E6B';

// Professional label shown in the subheader when no job_title is set, derived from plan
const PLAN_LABELS = {
  free: 'Bingoo Profile',
  professional: 'Professional',
  pro: 'Pro Member',
  salon: 'Salon Professional',
  restaurant: 'Restaurant',
  lawfirm: 'Legal Professional',
  business: 'Business',
  corporate: 'Corporate',
};

// classTemplateInfo — shared on the GenericClass. Each row references a textModule by id.
// Rows whose fieldPath doesn't resolve on a given object (module absent) are auto-hidden
// by Google Wallet, so no empty rows ever render.
const _twoItemRow = (id) => ({
  twoItems: {
    startItem: { firstValue: { fields: [{ fieldPath: `textModulesData.${id}.header` }] } },
    endItem: { firstValue: { fields: [{ fieldPath: `textModulesData.${id}.body` }] } },
  },
});
const _oneItemRow = (id) => ({
  oneItem: { item: { firstValue: { fields: [{ fieldPath: `textModulesData.${id}.body` }] } } },
});
const CLASS_TEMPLATE_INFO = {
  cardTemplateOverride: {
    cardRowTemplateInfos: [
      _twoItemRow('handle'),
      _twoItemRow('contact_phone'),
      _twoItemRow('contact_email'),
      _twoItemRow('contact_website'),
      _twoItemRow('contact_location'),
      _oneItemRow('tagline'),
      _oneItemRow('powered_by'),
    ],
  },
  listTemplateOverride: {
    firstRowOption: {
      firstValue: {
        fields: [
          { fieldPath: 'textModulesData.handle.body' },
        ],
      },
    },
  },
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { profile_id, username } = body;

    if (!profile_id && !username) {
      return Response.json({ error: 'profile_id or username is required' }, { status: 400 });
    }

    // ── Validate Google Wallet secrets ──
    const issuerId = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL');
    let privateKeyPem = Deno.env.get('GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY');

    if (!issuerId || !serviceAccountEmail || !privateKeyPem) {
      const missing = [
        !issuerId && 'GOOGLE_WALLET_ISSUER_ID',
        !serviceAccountEmail && 'GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL',
        !privateKeyPem && 'GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY',
      ].filter(Boolean);
      console.error(`Google Wallet secrets missing: ${missing.join(', ')}`);
      return Response.json({
        error: `Google Wallet credentials not configured. Missing: ${missing.join(', ')}. Set them in Settings → Environment Variables.`,
      }, { status: 500 });
    }

    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    // ── Auth: require logged-in user (ownership checked after profile fetch) ──
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized — login required to generate a wallet pass' }, { status: 401 });
    }

    // ── Fetch the EXACT profile by profile_id or username ──
    // Using service role to guarantee we can read the profile regardless of RLS,
    // then we verify ownership before minting the pass.
    let profile;
    if (profile_id) {
      profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    } else {
      const results = await base44.asServiceRole.entities.Profile.filter({ username });
      profile = results[0];
    }
    if (!profile) {
      return Response.json({
        error: `Profile not found for ${profile_id ? `id "${profile_id}"` : `username "${username}"`}`,
      }, { status: 404 });
    }

    // ── Ownership check: only the profile owner (or an admin) may generate a pass ──
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — you do not own this profile' }, { status: 403 });
    }

    const classId = `${issuerId}.bingoo_profile_class`;
    const objectId = `${issuerId}.bingoo_profile_${profile.id}`;
    // Never leak a Base44 editor/preview host into a public pass.
    const profileUrl = `${PUBLIC_APP_ORIGIN}/p/${encodeURIComponent(String(profile.username).trim().replace(/^@+/, ''))}`;
    // The request origin is authorized only to launch the save flow. The pass
    // barcode and profile button still point to the canonical production URL.
    const requestOrigin = (() => {
      try { return new URL(req.headers.get('origin') || PUBLIC_APP_ORIGIN).origin; }
      catch { return PUBLIC_APP_ORIGIN; }
    })();
    const saveOrigins = [...new Set([PUBLIC_APP_ORIGIN, requestOrigin]
      .filter((origin) => origin.startsWith('https://')))];

    // ── 1. Get OAuth2 access token via JWT bearer flow ──
    const now = Math.floor(Date.now() / 1000);
    const oauthJwt = await new SignJWT({
      iss: serviceAccountEmail,
      scope: WALLET_SCOPE,
      aud: OAUTH_TOKEN_URL,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);

    const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${oauthJwt}`,
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('OAuth token exchange failed:', JSON.stringify(tokenData));
      return Response.json({ error: 'Failed to authenticate with Google Wallet API' }, { status: 500 });
    }
    const accessToken = tokenData.access_token;

    // ── 2. Create GenericClass (idempotent — 409 if already exists) ──
    const classPayload = {
      id: classId,
      logo: { sourceUri: { uri: BINGOO_LOGO_URL } },
      classTemplateInfo: CLASS_TEMPLATE_INFO,
    };
    const classResponse = await fetch(`${WALLET_API_BASE}/genericClass`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classPayload),
    });
    if (!classResponse.ok && classResponse.status !== 409) {
      const errText = await classResponse.text();
      let errMsg;
      try { errMsg = JSON.parse(errText)?.error?.message || errText; } catch { errMsg = errText; }
      console.error(`[Wallet] GenericClass failed (${classResponse.status}): ${errMsg}`);
      if (classResponse.status === 403) {
        console.error('[Wallet 403] Enable API: https://console.developers.google.com/apis/api/walletobjects.googleapis.com/overview — Add service account to Wallet Console: https://pay.google.com/business/console');
      }
      return Response.json({ error: `GenericClass failed (${classResponse.status}): ${errMsg}` }, { status: 500 });
    }
    // Class already exists (409) — update it to ensure latest template + logo
    if (classResponse.status === 409) {
      await fetch(`${WALLET_API_BASE}/genericClass/${classId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(classPayload),
      });
    }

    // ── 3. Build GenericObject ──
    const truncate = (str, max) => str && str.length > max ? str.slice(0, max) + '…' : str || '';
    const cleanWebsite = (url) => (url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    // Convert all-caps names to readable title case; leave mixed-case names untouched
    const toTitleCase = (str) => {
      if (!str) return '';
      const upper = (str.match(/[A-Z]/g) || []).length;
      const lower = (str.match(/[a-z]/g) || []).length;
      if (upper > lower && upper > 1) {
        return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return str;
    };

    const displayName = toTitleCase(profile.display_name || 'Bingoo Profile');
    const professionalLabel = PLAN_LABELS[profile.plan] || 'Bingoo Profile';
    // Hierarchy: cardTitle = person's name, header = role/title, subheader = company
    const headerValue = profile.job_title || professionalLabel;
    const subheaderValue = profile.company_name || '';

    const websiteClean = cleanWebsite(profile.website);
    const passColor = /^#[0-9a-f]{6}$/i.test(profile.cover_color || '')
      ? profile.cover_color
      : BINGOO_NAVY;

    // Text modules — each non-empty field becomes its own module. Missing fields
    // → no module → the template row is auto-dropped by Google Wallet (no empty rows).
    // Company is shown in subheader, so it is NOT duplicated as a text module.
    const textModules = [];
    if (profile.username) {
      textModules.push({ id: 'handle', header: 'Handle', body: truncate(`@${profile.username}`, 40) });
    }
    if (profile.phone) {
      textModules.push({ id: 'contact_phone', header: 'Phone', body: truncate(profile.phone, 40) });
    }
    if (profile.email) {
      textModules.push({ id: 'contact_email', header: 'Email', body: truncate(profile.email, 50) });
    }
    if (websiteClean) {
      textModules.push({ id: 'contact_website', header: 'Website', body: truncate(websiteClean, 50) });
    }
    if (profile.location) {
      textModules.push({ id: 'contact_location', header: 'Location', body: truncate(profile.location, 50) });
    }
    textModules.push({ id: 'tagline', header: '', body: 'Connect • Share • Grow' });
    textModules.push({ id: 'powered_by', header: '', body: 'Powered by Bingoo Connect' });

    const objectBody = {
      id: objectId,
      classId,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: passColor,
      logo: {
        sourceUri: { uri: BINGOO_LOGO_URL },
      },
      // Hero image: profile_photo when available — gives a premium personal business-card feel
      ...(profile.profile_photo ? {
        heroImage: {
          sourceUri: { uri: profile.profile_photo },
          contentDescription: { defaultValue: { language: 'en', value: `${displayName} profile photo` } },
        },
      } : {}),
      cardTitle: { defaultValue: { language: 'en', value: truncate(displayName, 28) } },
      header: { defaultValue: { language: 'en', value: truncate(headerValue, 35) } },
      ...(subheaderValue ? { subheader: { defaultValue: { language: 'en', value: truncate(subheaderValue, 35) } } } : {}),
      textModulesData: textModules,
      linksModuleData: {
        uris: [{ uri: profileUrl, description: 'Open Bingoo Profile', id: 'profile_url' }],
      },
      // Large centered native Google Wallet QR code linking to the exact public profile URL
      barcode: {
        type: 'qrCode',
        value: profileUrl,
        alternateText: 'Scan to open profile',
      },
      state: 'ACTIVE',
    };

    // ── 4. Create GenericObject — if exists (409), update via PUT ──
    const objectResponse = await fetch(`${WALLET_API_BASE}/genericObject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objectBody),
    });

    if (objectResponse.status === 409) {
      // Object already exists — update it with latest profile data
      const updateResponse = await fetch(`${WALLET_API_BASE}/genericObject/${objectId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objectBody),
      });
      if (!updateResponse.ok) {
        const errText = await updateResponse.text();
        console.error('GenericObject update failed:', updateResponse.status, errText);
        return Response.json({ error: `Failed to update pass object: ${updateResponse.status}` }, { status: 500 });
      }
    } else if (!objectResponse.ok) {
      const errText = await objectResponse.text();
      let errMsg;
      try { errMsg = JSON.parse(errText)?.error?.message || errText; } catch { errMsg = errText; }
      console.error(`[Wallet] GenericObject failed (${objectResponse.status}): ${errMsg}`);
      return Response.json({ error: `GenericObject failed (${objectResponse.status}): ${errMsg}` }, { status: 500 });
    }

    // ── 5. Generate signed JWT for "Add to Google Wallet" link ──
    const saveJwt = await new SignJWT({
      iss: serviceAccountEmail,
      aud: 'google',
      origins: saveOrigins,
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        genericObjects: [{
          id: objectId,
          classId,
        }],
      },
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    const saveUrl = `${SAVE_URL_PREFIX}${saveJwt}`;

    return Response.json({ save_url: saveUrl });
  } catch (error) {
    console.error('Google Wallet pass error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});