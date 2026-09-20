import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, title, body: messageBody, url, _internalToken } = await req.json();

    const INTERNAL_TOKEN = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!INTERNAL_TOKEN || _internalToken !== INTERNAL_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user_id || !title) {
      return Response.json({ error: 'user_id and title are required' }, { status: 400 });
    }

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({ user_id, enabled: true });
    const webSubscriptions = subscriptions.filter((sub) => sub.endpoint && sub.p256dh && sub.auth);
    if (!webSubscriptions.length) {
      return Response.json({ success: true, sent: 0, web_sent: 0, message: 'No active browser subscriptions' });
    }

    const keyPairs = await base44.asServiceRole.entities.VapidKeyPair.list();
    let keyPair = keyPairs[0];
    if (!keyPair) {
      const generated = webpush.generateVAPIDKeys();
      keyPair = await base44.asServiceRole.entities.VapidKeyPair.create({
        public_key: generated.publicKey,
        private_key: generated.privateKey,
        label: 'default',
      });
    }
    let vapidEmail = (Deno.env.get('VAPID_EMAIL') || '').replace(/^"+|"+$/g, '').trim();
    if (!vapidEmail) vapidEmail = 'mailto:support@bingooconnect.com';
    if (!vapidEmail.startsWith('mailto:')) vapidEmail = 'mailto:' + vapidEmail;
    webpush.setVapidDetails(vapidEmail, keyPair.public_key, keyPair.private_key);

    const payload = JSON.stringify({ title, body: messageBody || '', url: url || '/bingoo' });
    let sent = 0;
    let failed = 0;
    const staleIds: string[] = [];

    for (const sub of webSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
        await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
          last_used_at: new Date().toISOString(),
        }).catch(() => {});
      } catch (err: any) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) staleIds.push(sub.id);
      }
    }

    for (const id of staleIds) {
      await base44.asServiceRole.entities.PushSubscription.delete(id).catch(() => {});
    }
    return Response.json({ success: true, sent, failed, web_sent: sent, cleaned: staleIds.length });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
