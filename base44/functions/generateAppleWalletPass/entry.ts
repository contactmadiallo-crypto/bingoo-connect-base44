import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import forge from 'npm:node-forge@1.3.1';
import JSZip from 'npm:jszip@3.10.1';

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
}

function uint8ToBinaryString(uint8: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < uint8.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunk)));
  }
  return binary;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { profile_id, username } = body;

    if (!profile_id && !username) {
      return Response.json({ error: 'profile_id or username is required' }, { status: 400 });
    }

    const teamId = Deno.env.get('APPLE_TEAM_ID');
    const passTypeId = Deno.env.get('APPLE_PASS_TYPE_ID');
    const certBase64 = Deno.env.get('APPLE_PASS_CERTIFICATE_BASE64');
    const certPassword = Deno.env.get('APPLE_PASS_CERTIFICATE_PASSWORD');
    const wwdrBase64 = Deno.env.get('APPLE_WWDR_CERTIFICATE_BASE64');

    if (!teamId || !passTypeId || !certBase64 || !certPassword || !wwdrBase64) {
      console.error('Apple Wallet secrets missing');
      return Response.json({ error: 'Apple Wallet certificates not configured' }, { status: 500 });
    }

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

    const profileUrl = `https://bingooconnect.com/p/${profile.username}`;
    const color = profile.cover_color || '#0B2E6B';

    // Build pass.json
    const passJson: Record<string, any> = {
      formatVersion: 1,
      passTypeIdentifier: passTypeId,
      serialNumber: `bingoo-${profile.id}`,
      teamIdentifier: teamId,
      organizationName: profile.company_name || 'Bingoo Connect',
      description: `${profile.display_name} - Bingoo Digital Card`,
      logoText: profile.display_name || 'Bingoo Connect',
      backgroundColor: hexToRgb(color),
      foregroundColor: 'rgb(255,255,255)',
      labelColor: 'rgb(253,186,33)',
      generic: {
        primaryFields: [
          { key: 'name', label: 'Name', value: profile.display_name || '' },
        ],
        secondaryFields: [
          ...(profile.job_title ? [{ key: 'title', label: 'Title', value: profile.job_title }] : []),
          ...(profile.company_name ? [{ key: 'company', label: 'Company', value: profile.company_name }] : []),
        ],
        auxiliaryFields: [
          ...(profile.phone ? [{ key: 'phone', label: 'Phone', value: profile.phone }] : []),
          ...(profile.email ? [{ key: 'email', label: 'Email', value: profile.email }] : []),
          ...(profile.website ? [{ key: 'website', label: 'Website', value: profile.website.replace(/^https?:\/\//, '') }] : []),
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: profileUrl,
          messageEncoding: 'iso-8859-1',
          altText: 'Scan to view profile',
        },
      ],
    };

    // Fetch Bingoo logo for icon.png and logo.png
    const logoUrl = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png';
    const logoResponse = await fetch(logoUrl);
    const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());

    // Collect all files (binary strings for forge hashing)
    const fileEntries: { name: string; data: Uint8Array }[] = [
      { name: 'pass.json', data: new TextEncoder().encode(JSON.stringify(passJson, null, 2)) },
      { name: 'icon.png', data: logoBytes },
      { name: 'logo.png', data: logoBytes },
    ];

    // Try to fetch profile photo for thumbnail
    if (profile.profile_photo) {
      try {
        const photoRes = await fetch(profile.profile_photo);
        if (photoRes.ok) {
          fileEntries.push({ name: 'thumbnail.png', data: new Uint8Array(await photoRes.arrayBuffer()) });
        }
      } catch (e) {
        console.warn('Could not fetch profile photo for pass thumbnail:', e.message);
      }
    }

    // Create manifest (SHA1 of each file)
    const manifest: Record<string, string> = {};
    for (const entry of fileEntries) {
      const md = forge.md.sha1.create();
      md.update(uint8ToBinaryString(entry.data));
      manifest[entry.name] = md.digest().toHex();
    }
    const manifestJson = JSON.stringify(manifest);

    // Load P12 certificate
    const p12Der = forge.util.decode64(certBase64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12fromAsn1(p12Asn1, certPassword);

    const certBagType = forge.pki.oids.certBag;
    const keyBagType = forge.pki.oids.pkcs8ShroudedKeyBag;
    const certBags = p12.getBags({ bagType: certBagType });
    const keyBags = p12.getBags({ bagType: keyBagType });

    const cert = certBags[certBagType][0].cert;
    const key = keyBags[keyBagType][0].key;

    // Load WWDR certificate
    const wwdrDer = forge.util.decode64(wwdrBase64);
    const wwdrAsn1 = forge.asn1.fromDer(wwdrDer);
    const wwdrCert = forge.pki.certificateFromAsn1(wwdrAsn1);

    // Create PKCS#7 detached signature of manifest
    const p7 = forge.pkcs7.createSignedData(manifestJson);
    p7.addCertificate(cert);
    p7.addCertificate(wwdrCert);
    p7.addSigner({
      key: key,
      certificate: cert,
      digestAlgorithm: forge.pki.oids.sha1,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        { type: forge.pki.oids.signingTime, value: new Date() },
      ],
    });
    p7.sign({ detached: true });

    const signatureDerString = forge.asn1.toDer(p7.toAsn1()).getBytes();
    const signatureBytes = new Uint8Array(signatureDerString.length);
    for (let i = 0; i < signatureDerString.length; i++) {
      signatureBytes[i] = signatureDerString.charCodeAt(i);
    }

    // Create ZIP (.pkpass)
    const zip = new JSZip();
    for (const entry of fileEntries) {
      zip.file(entry.name, entry.data);
    }
    zip.file('manifest.json', manifestJson);
    zip.file('signature', signatureBytes);

    const pkpassBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    return new Response(pkpassBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${profile.username || 'bingoo'}.pkpass"`,
        'Content-Length': String(pkpassBuffer.length),
      },
    });
  } catch (error) {
    console.error('Apple Wallet pass error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});