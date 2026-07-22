import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Triggered by an entity automation on User "create" — sends a welcome email to new sign-ups.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function must only be callable by an admin / service-role automation
    // context (entity automation on User "create"). Anonymous callers and ordinary
    // signed-in users are rejected to prevent email spoofing / abuse of the welcome email.
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const userData = payload?.data;

    if (!userData?.email) {
      return Response.json({ skipped: true, reason: 'No email on new user payload' });
    }

    const name = userData.full_name || 'there';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userData.email,
      subject: 'Welcome to Bingoo Connect! 🎉',
      from_name: 'Bingoo Connect',
      body: `Hi ${name},\n\nWelcome to Bingoo Connect! Your account is ready.\n\nSet up your digital profile, add your links and contact info, and start sharing it with a tap, scan, or link.\n\nGet started: https://bingooconnect.com\n\nCheers,\nThe Bingoo Connect Team`,
    });

    return Response.json({ sent: true });
  } catch (error) {
    console.error('onUserSignup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});