import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const vapidPublicKey = (Deno.env.get('VAPID_PUBLIC_KEY') || '').replace(/^"+|"+$/g, '').trim();
    if (!vapidPublicKey) {
      return Response.json({ error: 'VAPID public key not configured' }, { status: 500 });
    }
    return Response.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('getVapidPublicKey error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});