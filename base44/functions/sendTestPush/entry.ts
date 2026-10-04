import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ownerLanguage } from '../../shared/notifyOwner.ts';

/**
 * sendTestPush — lets a signed-in user send a test push to THEIR OWN enabled devices.
 *
 * `sendPushNotification` is an internal function (it requires a server-only token), so the
 * "Send test alert" button in Account Settings could never call it directly and always failed with
 * 401. This wrapper authenticates the user, fixes the target to the caller (no user_id from the
 * client), and localizes the message.
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const lang = await ownerLanguage(base44, user.id);
    const fr = lang === 'fr';
    const res = await base44.asServiceRole.functions.invoke('sendPushNotification', {
      user_id: user.id,
      title: fr ? '🔔 Alerte de test Bingoo' : '🔔 Test alert from Bingoo',
      body: fr
        ? 'Les alertes fonctionnent ! Vous recevrez ici vos nouveaux prospects et rappels de rendez-vous.'
        : "Phone alerts are working! You'll get new lead and appointment alerts here.",
      url: '/bingoo',
      _internalToken: Deno.env.get('VAPID_PRIVATE_KEY'),
    });
    const data = res?.data ?? res ?? {};
    return Response.json({ success: true, sent: data.sent ?? data.web_sent ?? 0 });
  } catch (error) {
    console.error('[sendTestPush]', (error as Error)?.message || error);
    return Response.json({ error: 'Could not send test alert' }, { status: 500 });
  }
});
