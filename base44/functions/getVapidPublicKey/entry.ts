import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    // Strip quotes, commas, PEM headers, whitespace — keep only valid base64 chars.
    // Secrets may be stored with surrounding quotes, trailing commas, or stray characters.
    const cleanKey = (s) =>
      (s || '')
        .replace(/-----[^-]+-----/g, '')
        .replace(/[^A-Za-z0-9\-_+/=]/g, '')
        .trim();
    const vapidPublicKey = cleanKey(Deno.env.get('VAPID_PUBLIC_KEY') || '');
    if (!vapidPublicKey) {
      return Response.json({ error: 'VAPID public key not configured' }, { status: 500 });
    }
    return Response.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('getVapidPublicKey error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});