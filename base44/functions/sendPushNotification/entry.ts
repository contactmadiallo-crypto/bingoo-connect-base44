import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';
import { GoogleAuth } from 'npm:google-auth-library@9.15.1';

async function sendFcm(token: string, title: string, body: string, url: string) {
  const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
  const credentials = JSON.parse(raw);
  const projectId = credentials.project_id;
  if (!projectId) throw new Error('Firebase service account is missing project_id');

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const client = await auth.getClient();
  const access = await client.getAccessToken();
  const accessToken = typeof access === 'string' ? access : access?.token;
  if (!accessToken) throw new Error('Could not obtain Firebase access token');

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: {
            url: url || '/bingoo',
            action_url: url || '/bingoo',
          },
          android: {
            priority: 'high',
            notification: {
              channel_id: 'bingoo_alerts',
              sound: 'default',
              default_vibrate_timings: true,
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    const error: any = new Error(`FCM ${response.status}: ${text}`);
    error.statusCode = response.status;
    error.responseText = text;
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const requestBody = await req.json();
    const { user_id, title, body: messageBody, url, _internalToken } = requestBody;

    const INTERNAL_TOKEN = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!INTERNAL_TOKEN || _internalToken !== INTERNAL_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user_id || !title) {
      return Response.json({ error: 'user_id and title are required' }, { status: 400 });
    }

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_id,
      enabled: true,
    });
    if (subscriptions.length === 0) {
      return Response.json({ success: true, sent: 0, web_sent: 0, native_sent: 0, message: 'No active subscriptions' });
    }

    // Configure Web Push only when at least one browser subscription exists.
    const webSubscriptions = subscriptions.filter((sub) =>
      sub.endpoint && sub.p256dh && sub.auth
    );
    if (webSubscriptions.length > 0) {
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
    }

    const payload = JSON.stringify({
      title,
      body: messageBody || '',
      url: url || '/bingoo',
    });

    let sent = 0;
    let failed = 0;
    let webSent = 0;
    let nativeSent = 0;
    const staleIds: string[] = [];

    for (const sub of subscriptions) {
      try {
        if (sub.transport === 'fcm') {
          if (!sub.fcm_token) throw new Error('Native subscription has no FCM token');
          await sendFcm(sub.fcm_token, title, messageBody || '', url || '/bingoo');
          nativeSent++;
        } else {
          if (!sub.endpoint || !sub.p256dh || !sub.auth) continue;
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          webSent++;
        }
        sent++;
        await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
          last_used_at: new Date().toISOString(),
        }).catch(() => {});
      } catch (err: any) {
        failed++;
        console.error(`Push failed for sub ${sub.id} (${sub.transport || 'webpush'}):`, err.statusCode, err.message);
        const text = String(err.responseText || err.message || '');
        const staleWeb = (err.statusCode === 410 || err.statusCode === 404);
        if (staleWeb) staleIds.push(sub.id);
      }
    }

    for (const id of staleIds) {
      await base44.asServiceRole.entities.PushSubscription.delete(id).catch(() => {});
    }

    return Response.json({
      success: true,
      sent,
      failed,
      web_sent: webSent,
      native_sent: nativeSent,
      cleaned: staleIds.length,
    });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
