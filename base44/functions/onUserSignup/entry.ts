import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Triggered by an entity automation on User "create" — sends a welcome email to new sign-ups.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check — automation calls run as service role (authenticated).
    // Direct anonymous HTTP calls must validate the target user exists.
    const caller = await base44.auth.me();
    const isAuthed = caller || await base44.auth.isAuthenticated();

    const payload = await req.json();
    const userData = payload?.data;

    if (!userData?.email) {
      return Response.json({ skipped: true, reason: 'No email on new user payload' });
    }

    // For unauthenticated direct calls, verify the email is a real registered user
    // to prevent arbitrary email abuse via this endpoint.
    if (!isAuthed) {
      const users = await base44.asServiceRole.entities.User.filter({ email: userData.email }, '-created_date', 1);
      if (!users?.length) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
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