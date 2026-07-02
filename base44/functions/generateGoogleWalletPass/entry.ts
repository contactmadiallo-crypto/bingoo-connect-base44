import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

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

    // Fix literal \n in env var
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();

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

    // Import private key
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    const classId = `${issuerId}.bingoo_profile_class`;
    const objectId = `${issuerId}.bingoo_profile_${profile.id}`;

    const profileUrl = `https://bingooconnect.com/p/${profile.username}`;
    const hexBg = (profile.cover_color || '#0B2E6B').replace('#', '');

    const genericClass = {
      id: classId,
      imageModulesData: profile.profile_photo
        ? [{ mainImage: { sourceUri: { uri: profile.profile_photo } } }]
        : [],
    };

    const textModules = [];
    if (profile.phone) textModules.push({ id: 'phone', header: 'Phone', body: profile.phone });
    if (profile.email) textModules.push({ id: 'email', header: 'Email', body: profile.email });
    if (profile.website) textModules.push({ id: 'website', header: 'Website', body: profile.website });
    if (profile.location) textModules.push({ id: 'location', header: 'Location', body: profile.location });

    const genericObject = {
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

    const payload = {
      iss: serviceAccountEmail,
      aud: 'google',
      origins: ['https://bingooconnect.com'],
      typ: 'savetowallet',
      payload: {
        genericClasses: [genericClass],
        genericObjects: [genericObject],
      },
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);

    const saveUrl = `https://wallet.google.com/wallet/save?jwt=${jwt}`;

    return Response.json({ save_url: saveUrl });
  } catch (error) {
    console.error('Google Wallet pass error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});