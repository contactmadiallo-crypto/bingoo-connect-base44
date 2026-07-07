import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

// Returns the VAPID public key for browser push subscription.
// On first call, generates a new VAPID key pair and stores it in the
// VapidKeyPair entity — no secrets required.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const existing = await base44.asServiceRole.entities.VapidKeyPair.list();
    let keyPair = existing.length > 0 ? existing[0] : null;

    if (!keyPair) {
      const generated = webpush.generateVAPIDKeys();
      keyPair = await base44.asServiceRole.entities.VapidKeyPair.create({
        public_key: generated.publicKey,
        private_key: generated.privateKey,
        label: 'default',
      });
    }

    return Response.json({ publicKey: keyPair.public_key });
  } catch (error) {
    console.error('getVapidPublicKey error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});