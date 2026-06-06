import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const vapidPublicKey = (Deno.env.get('VAPID_PUBLIC_KEY') || '').replace(/^"+|"+$/g, '').trim();
    const vapidPrivateKey = (Deno.env.get('VAPID_PRIVATE_KEY') || '').replace(/^"+|"+$/g, '').trim();
    const vapidEmail = (Deno.env.get('VAPID_EMAIL') || '').replace(/^"+|"+$/g, '').trim();

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const { user_id, profile_id, title, body, url } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get the user's push subscriptions
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    const targetUser = users?.[0];

    if (!targetUser?.data?.push_subscriptions?.length) {
      return Response.json({ success: false, reason: 'No push subscriptions found for user' });
    }

    const payload = JSON.stringify({ title, body, url: url || '/bingoo', icon: '/icons/icon-192x192.png' });

    const results = [];
    for (const sub of targetUser.data.push_subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        results.push({ endpoint: sub.endpoint, status: 'sent' });
      } catch (err) {
        console.error('Push send error for endpoint:', sub.endpoint, err.message);
        results.push({ endpoint: sub.endpoint, status: 'failed', error: err.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});