import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { profileId } = await req.json();

    if (!profileId) {
      return Response.json({ resume: null });
    }

    const resumes = await base44.asServiceRole.entities.Resume.filter({
      profile_id: profileId,
      attached_to_profile: true,
      is_public: true,
    });

    return Response.json({ resume: resumes?.[0] || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});