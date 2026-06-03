import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { profile_id, name, phone, email, message } = body;

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Use service role so unauthenticated visitors (NFC card scanners) can submit leads
    const lead = await base44.asServiceRole.entities.Lead.create({
      profile_id,
      name: name || '',
      phone: phone || '',
      email: email || '',
      message: message || '',
    });

    return Response.json({ success: true, lead });
  } catch (error) {
    console.error('createPublicLead error:', error.message, JSON.stringify(error));
    return Response.json({ error: error.message }, { status: 500 });
  }
});