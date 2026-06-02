import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { profile_id } = body;

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    const items = await base44.asServiceRole.entities.PortfolioItem.filter(
      { profile_id },
      'order'
    );

    return Response.json({ items: items || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});