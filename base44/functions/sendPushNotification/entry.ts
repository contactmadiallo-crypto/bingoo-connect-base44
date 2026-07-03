import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

// Internal helper — invoked by other backend functions (createPublicLead,
// sendAppointmentReminders) to deliver a web push notification to every
// active PushSubscription record owned by a given user.
// It runs with the service role (no user auth) so public-endpoint callers
// and scheduled automations can use it.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { user_id, title, body: messageBody, url } = body;

    if (!user_id || !title) {
      return Response.json({ error: 'user_id and title are required' }, { status: 400 });
    }

    // web-push expects URL-safe base64 without padding.
    // Secrets may be stored with surrounding quotes, commas, PEM headers, or
    // whitespace — extract only valid base64 characters.
    const cleanKey = (s) =>
      (s || '')
        .replace(/-----[^-]+-----/g, '')
        .replace(/[^A-Za-z0-9\-_+/=]/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    let vapidPublicKey = cleanKey(Deno.env.get('VAPID_PUBLIC_KEY') || '');
    const vapidPrivateKey = cleanKey(Deno.env.get('VAPID_PRIVATE_KEY') || '');
    let vapidEmail = (Deno.env.get('VAPID_EMAIL') || '').replace(/^"+|"+$/g, '').trim();
    if (!vapidEmail) vapidEmail = 'mailto:support@bingooconnect.com';
    if (!vapidEmail.startsWith('mailto:')) vapidEmail = 'mailto:' + vapidEmail;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('sendPushNotification: VAPID keys not configured');
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    // VAPID private key must be 32 bytes (43 base64url chars). If it's 87
    // chars it's the public key — flag this clearly so the secret can be fixed.
    if (vapidPrivateKey.length === 87 && vapidPrivateKey.startsWith('BK')) {
      return Response.json(
        { error: 'VAPID_PRIVATE_KEY appears to contain the public key. Set it to the 32-byte private key (43 base64url chars), not the 87-char public key.' },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_id,
      enabled: true,
    });

    if (subscriptions.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No active subscriptions' });
    }

    const payload = JSON.stringify({
      title,
      body: messageBody || '',
      url: url || '/bingoo',
    });

    let sent = 0;
    let failed = 0;
    const staleIds: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
        try {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
            last_used_at: new Date().toISOString(),
          });
        } catch (e) {
          /* non-blocking */
        }
      } catch (err: any) {
        failed++;
        console.error(`Push failed for sub ${sub.id}:`, err.statusCode, err.message);
        // 410 Gone / 404 = subscription expired — clean it up
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleIds.push(sub.id);
        }
      }
    }

    for (const id of staleIds) {
      try {
        await base44.asServiceRole.entities.PushSubscription.delete(id);
      } catch (e) {
        /* non-blocking */
      }
    }

    return Response.json({ success: true, sent, failed, cleaned: staleIds.length });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});