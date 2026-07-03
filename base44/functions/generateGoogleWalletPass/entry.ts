import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

const WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const WALLET_SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const SAVE_URL_PREFIX = 'https://pay.google.com/gp/v/save/';

// Official Bingoo Connect commercial brand logo — used for all public brand imagery.
// Never use personal photos, user profile photos, or gallery images here.
const BINGOO_LOGO_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png';

// classTemplateInfo — shared on the GenericClass. Surfaces contact rows + brand taglines
// on the FRONT card (between the header and the QR). Rows whose fieldPath doesn't resolve
// on a given object (field absent) are auto-hidden by Google Wallet, so no empty rows render.
// listTemplateOverride shows company/phone in the pass list view.
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
      _twoItemRow('contact_phone'),
      _twoItemRow('contact_email'),
      _twoItemRow('contact_website'),
      _twoItemRow('contact_location'),
      _twoItemRow('contact_company'),
      _oneItemRow('tagline'),
      _oneItemRow('powered_by'),
    ],
  },
  listTemplateOverride: {
    firstRowOption: {
      firstValue: {
        fields: [
          { fieldPath: 'textModulesData.contact_company.body' },
          { fieldPath: 'textModulesData.contact_phone.body' },
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

    const issuerId = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL');
    let privateKeyPem = Deno.env.get('GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY');

    if (!issuerId || !serviceAccountEmail || !privateKeyPem) {
      console.error('Google Wallet secrets missing');
      return Response.json({ error: 'Google Wallet credentials not configured' }, { status: 500 });
    }

    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    // Fetch profile
    const base44 = createClientFromRequest(req);
    let profile;
    if (profile_id) {
      profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    } else {
      const results = await base44.asServiceRole.entities.Profile.filter({ username });
      profile = results[0];
    }
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Ownership check: only the profile owner (or an admin) may generate a wallet pass.
    // Public visitors must never be able to mint passes for someone else's profile.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: you do not own this profile' }, { status: 403 });
    }

    const classId = `${issuerId}.bingoo_profile_class`;
    const objectId = `${issuerId}.bingoo_profile_${profile.id}`;
    const profileUrl = `https://bingooconnect.com/p/${profile.username}`;

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
    const classResponse = await fetch(`${WALLET_API_BASE}/genericClass`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: classId,
        logo: { sourceUri: { uri: BINGOO_LOGO_URL } },
        classTemplateInfo: CLASS_TEMPLATE_INFO,
      }),
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
    // Class already exists (409) — update it to ensure logo + hero are set
    if (classResponse.status === 409) {
      await fetch(`${WALLET_API_BASE}/genericClass/${classId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          logo: { sourceUri: { uri: BINGOO_LOGO_URL } },
          classTemplateInfo: CLASS_TEMPLATE_INFO,
        }),
      });
    }

    // ── 3. Build GenericObject ──
    // Truncate to keep text short and prevent mobile overflow
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

    // Premium Bingoo brand accent — navy card (the only pass-level color Google Wallet supports)
    const BINGOO_NAVY = '#0B2E6B';

    // Subheader: prefer profession/title, then company, for a business-card feel
    const subheaderValue = profile.job_title || profile.company_name || '';
    const displayName = toTitleCase(profile.display_name || 'Bingoo Profile');

    // Contact + brand text modules — each non-empty field becomes its own module so the
    // class cardTemplateOverride can surface it on the front card. Missing fields → no module
    // → the template row is auto-dropped by Google Wallet (no empty rows).
    const websiteClean = cleanWebsite(profile.website);
    const textModules = [
      { id: 'card_type', header: 'Bingoo Connect', body: 'Digital Profile Card' },
    ];
    if (profile.phone) textModules.push({ id: 'contact_phone', header: 'Phone', body: truncate(profile.phone, 40) });
    if (profile.email) textModules.push({ id: 'contact_email', header: 'Email', body: truncate(profile.email, 50) });
    if (websiteClean) textModules.push({ id: 'contact_website', header: 'Website', body: truncate(websiteClean, 50) });
    if (profile.location) textModules.push({ id: 'contact_location', header: 'Location', body: truncate(profile.location, 50) });
    if (profile.company_name && profile.company_name !== subheaderValue) {
      textModules.push({ id: 'contact_company', header: 'Company', body: truncate(profile.company_name, 50) });
    }
    textModules.push({ id: 'tagline', header: '', body: 'Connect • Share • Grow' });
    textModules.push({ id: 'powered_by', header: '', body: 'Powered by Bingoo Connect' });

    const objectBody = {
      id: objectId,
      classId,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      // Premium Bingoo navy background — fixed brand color, never user-supplied
      hexBackgroundColor: BINGOO_NAVY,
      logo: {
        sourceUri: {
          uri: BINGOO_LOGO_URL,
        },
      },
      cardTitle: { defaultValue: { language: 'en', value: 'Bingoo Connect' } },
      header: { defaultValue: { language: 'en', value: truncate(displayName, 28) } },
      ...(subheaderValue ? { subheader: { defaultValue: { language: 'en', value: truncate(subheaderValue, 35) } } } : {}),
      textModulesData: textModules,
      linksModuleData: {
        uris: [{ uri: profileUrl, description: 'Open Bingoo Profile', id: 'profile_url' }],
      },
      // Large centered native Google Wallet QR code linking to the public profile
      barcode: {
        type: 'qrCode',
        value: profileUrl,
        alternateText: 'Scan to open Bingoo profile',
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
      origins: ['https://bingooconnect.com'],
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