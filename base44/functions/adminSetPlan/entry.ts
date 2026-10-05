import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Admin-only: set a user's plan by hand (plan_source = 'admin_override').
 *
 * This is the ONLY place the app writes an admin-granted Subscription. The browser no longer
 * writes Subscription directly (Billing admin switcher, AdminDashboard plan override,
 * Users & Entitlements tab all call this). The role check happens here, on the server.
 *
 * Status rule (same as the old client code):
 *  - record already linked to a Stripe subscription -> change plan only, keep Stripe's status
 *  - otherwise -> status 'free' for the free plan, 'active' for any paid plan
 */

const ALLOWED_PLANS = new Set([
  'free', 'professional', 'pro', 'salon', 'restaurant', 'lawfirm', 'business', 'corporate',
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim();
    const plan = String(body.plan || '').trim();
    const customerName = String(body.customer_name || '').trim().slice(0, 200);

    if (!EMAIL_RE.test(email)) return Response.json({ error: 'A valid email is required' }, { status: 400 });
    if (!ALLOWED_PLANS.has(plan)) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const Subscription = base44.asServiceRole.entities.Subscription;
    const existing = (await Subscription.filter({ customer_email: email }))?.[0] || null;
    const status = plan === 'free' ? 'free' : 'active';

    let record;
    if (existing?.stripe_subscription_id) {
      record = await Subscription.update(existing.id, { plan, plan_source: 'admin_override' });
    } else if (existing) {
      record = await Subscription.update(existing.id, { plan, status, plan_source: 'admin_override' });
    } else {
      record = await Subscription.create({
        customer_email: email,
        customer_name: customerName || email,
        plan,
        status,
        plan_source: 'admin_override',
      });
    }

    // Audit trail (best effort: never blocks the plan change itself).
    try {
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'plan_override',
        performed_by: admin.id,
        performed_by_name: admin.full_name || '',
        performed_by_email: admin.email,
        target_type: 'Subscription',
        target_id: record?.id || existing?.id || email,
        target_name: email,
        old_value: existing?.plan || 'none',
        new_value: plan,
        notes: `Admin manually set plan to ${plan}`,
      });
    } catch (e) {
      console.warn('adminSetPlan audit log failed:', (e as Error)?.message);
    }

    return Response.json({ success: true, subscription_id: record?.id || existing?.id || null, plan });
  } catch (error) {
    console.error('adminSetPlan error:', (error as Error)?.message);
    return Response.json({ error: 'Unable to set plan' }, { status: 500 });
  }
});
