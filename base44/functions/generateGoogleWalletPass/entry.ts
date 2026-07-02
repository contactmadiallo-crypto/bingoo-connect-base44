import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

const WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const WALLET_SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const SAVE_URL_PREFIX = 'https://pay.google.com/gp/v/save/';

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

    const classId = `${issuerId}.bingoo_profile_class`;
    const objectId = `${issuerId}.bingoo_profile_${profile.id}`;
    const profileUrl = `https://bingooconnect.com/p/${profile.username}`;
    const hexBg = (profile.cover_color || '#0B2E6B').replace('#', '');

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
      body: JSON.stringify({ id: classId }),
    });
    if (!classResponse.ok && classResponse.status !== 409) {
      const errText = await classResponse.text();
      if (classResponse.status === 403) {
        console.error('[Google Wallet 403] GenericClass creation forbidden. Full Google error:', errText);
        console.error('This usually means: (1) Google Wallet API is not enabled in your Google Cloud project, OR (2) the service account is not added to the Google Pay & Wallet Console users with "Wallet Object Issuer" access. Enable API: https://console.developers.google.com/apis/api/walletobjects.googleapis.com/overview — Add service account at: https://pay.google.com/business/console');
      } else {
        console.error('GenericClass creation failed:', classResponse.status, errText);
      }
      return Response.json({ error: `Failed to create pass class (HTTP ${classResponse.status}). Check function logs for the full Google error message.` }, { status: 500 });
    }

    // ── 3. Build GenericObject ──
    const textModules = [];
    if (profile.phone) textModules.push({ id: 'phone', header: 'Phone', body: profile.phone });
    if (profile.email) textModules.push({ id: 'email', header: 'Email', body: profile.email });
    if (profile.website) textModules.push({ id: 'website', header: 'Website', body: profile.website });
    if (profile.location) textModules.push({ id: 'location', header: 'Location', body: profile.location });

    const objectBody = {
      id: objectId,
      classId,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: hexBg,
      logo: {
        sourceUri: {
          uri: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png',
        },
      },
      cardTitle: { defaultValue: { language: 'en', value: profile.company_name || 'Bingoo Connect' } },
      subtitle: { defaultValue: { language: 'en', value: profile.job_title || '' } },
      header: { defaultValue: { language: 'en', value: profile.display_name || 'Bingoo Profile' } },
      textModulesData: textModules,
      linksModuleData: {
        uris: [{ uri: profileUrl, description: 'View Profile', id: 'profile_url' }],
      },
      barcode: {
        type: 'BARCODE_TYPE_QR_CODE',
        value: profileUrl,
        alternateText: 'Scan to view profile',
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
      if (objectResponse.status === 403) {
        console.error('[Google Wallet 403] GenericObject creation forbidden. Full Google error:', errText);
        console.error('This usually means: (1) Google Wallet API is not enabled in your Google Cloud project, OR (2) the service account is not added to the Google Pay & Wallet Console users with "Wallet Object Issuer" access. Enable API: https://console.developers.google.com/apis/api/walletobjects.googleapis.com/overview — Add service account at: https://pay.google.com/business/console');
      } else {
        console.error('GenericObject creation failed:', objectResponse.status, errText);
      }
      return Response.json({ error: `Failed to create pass object (HTTP ${objectResponse.status}). Check function logs for the full Google error message.` }, { status: 500 });
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