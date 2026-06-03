import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { profile_id, visitor_name, visitor_email, visitor_phone, date, time_slot, notes } = body;

    if (!profile_id || !visitor_name || !visitor_email) {
      return Response.json({ error: 'profile_id, visitor_name, and visitor_email are required' }, { status: 400 });
    }

    // Use service role so unauthenticated visitors (NFC card scanners) can book appointments
    const appointment = await base44.asServiceRole.entities.Appointment.create({
      profile_id,
      visitor_name,
      visitor_email,
      visitor_phone: visitor_phone || '',
      date,
      time_slot,
      notes: notes || '',
      status: 'pending',
    });

    return Response.json({ success: true, appointment });
  } catch (error) {
    console.error('createPublicAppointment error:', error.message, JSON.stringify(error));
    return Response.json({ error: error.message }, { status: 500 });
  }
});