import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { computeShipping } from '../../shared/shippingConfig.ts';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req); // binds request to the Bingoo app; no privileged read/write.
    const body = await req.json();
    const country = String(body.country || '').trim();
    const subtotalCents = Math.max(0, Math.round(Number(body.subtotal_cents) || 0));
    if (!country) return Response.json({ error: 'country is required.' }, { status: 400 });
    if (subtotalCents > 100000000) return Response.json({ error: 'Invalid subtotal.' }, { status: 400 });
    const quote = computeShipping(subtotalCents, country);
    return Response.json({ success:true, ...quote });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to quote shipping.' }, { status: 400 });
  }
});