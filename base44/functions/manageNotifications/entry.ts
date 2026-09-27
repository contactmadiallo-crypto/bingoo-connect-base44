import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');
    const id = body?.id ? String(body.id) : '';

    const list = await base44.asServiceRole.entities.BingooNotification.filter({ user_id: user.id }, '-created_date', 200);

    if (action === 'clear_all') {
      const results = await Promise.allSettled(list.map(n => base44.asServiceRole.entities.BingooNotification.delete(n.id)));
      const failed = results.filter(r => r.status === 'rejected').length;
      return Response.json({ ok: failed === 0, deleted: list.length - failed, failed });
    }

    if (action === 'mark_all_read') {
      const unread = list.filter(n => !n.is_read);
      const results = await Promise.allSettled(unread.map(n => base44.asServiceRole.entities.BingooNotification.update(n.id, { is_read: true })));
      const failed = results.filter(r => r.status === 'rejected').length;
      return Response.json({ ok: failed === 0, updated: unread.length - failed, failed });
    }

    if (!id) return Response.json({ error: 'Notification id required' }, { status: 400 });
    const target = list.find(n => n.id === id);
    if (!target) return Response.json({ error: 'Notification not found' }, { status: 404 });

    if (action === 'clear_one') {
      await base44.asServiceRole.entities.BingooNotification.delete(id);
      return Response.json({ ok: true, deleted: 1 });
    }

    if (action === 'mark_read') {
      await base44.asServiceRole.entities.BingooNotification.update(id, { is_read: true });
      return Response.json({ ok: true, updated: 1 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[manageNotifications]', error?.message || error);
    return Response.json({ error: 'Notification action failed' }, { status: 500 });
  }
});
