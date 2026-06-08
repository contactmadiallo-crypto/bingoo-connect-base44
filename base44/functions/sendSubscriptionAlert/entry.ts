import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { customer_email, customer_name, plan, action, admin_email, amount } = await req.json();

    if (!admin_email || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const actionLabels = {
      created: '🎉 New Subscriber',
      upgraded: '📈 Plan Upgrade',
      downgraded: '📉 Plan Downgrade',
      canceled: '❌ Subscription Canceled',
      past_due: '⚠️ Payment Failed',
      renewed: '✅ Subscription Renewed'
    };

    const actionMessages = {
      created: `New subscriber just signed up for ${plan}!`,
      upgraded: `${customer_name || customer_email} upgraded to ${plan}!`,
      downgraded: `${customer_name || customer_email} downgraded their plan.`,
      canceled: `${customer_name || customer_email} canceled their subscription.`,
      past_due: `Payment failed for ${customer_name || customer_email}. Intervention may be needed.`,
      renewed: `${customer_name || customer_email}'s subscription has been renewed.`
    };

    const amountText = amount ? ` (${(amount / 100).toFixed(2)})` : '';

    const emailRes = await base44.integrations.Core.SendEmail({
      to: admin_email,
      subject: `${actionLabels[action]} - Bingoo Subscription Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF7A00;">${actionLabels[action]}</h2>
          <p><strong>Customer:</strong> ${customer_name || customer_email}</p>
          <p><strong>Email:</strong> ${customer_email}</p>
          <p><strong>Plan:</strong> ${plan}</p>
          ${amount ? `<p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>` : ''}
          <p style="margin-top: 20px; color: #666;">${actionMessages[action]}</p>
          <p style="margin-top: 30px; text-align: center;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://bingoo.app'}/admin?tab=subscriptions" style="background: #FF7A00; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">View Subscriber</a>
          </p>
        </div>
      `
    });

    console.log(`[Email Alert] ${action} notification sent to ${admin_email}`);

    return Response.json({ success: true, message: 'Alert email sent' });
  } catch (error) {
    console.error('Error sending subscription alert:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});