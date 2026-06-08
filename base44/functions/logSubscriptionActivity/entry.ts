import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { subscription_id, customer_email, customer_name, plan, action, old_plan, status, old_status, amount, details } = await req.json();

    if (!customer_email || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log activity
    await base44.asServiceRole.entities.SubscriptionActivity.create({
      customer_email,
      customer_name: customer_name || '',
      plan: plan || '',
      action,
      old_plan: old_plan || null,
      old_status: old_status || null,
      status: status || 'active',
      amount: amount || 0,
      stripe_subscription_id: subscription_id || '',
      details: details || '',
      activity_date: new Date().toISOString()
    });

    console.log(`[Subscription Activity] ${action.toUpperCase()} - ${customer_email} on ${plan}`);

    return Response.json({ success: true, message: 'Activity logged' });
  } catch (error) {
    console.error('Error logging subscription activity:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});