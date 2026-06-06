import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return Response.json({ error: 'resumeId is required' }, { status: 400 });
    }

    const resumes = await base44.asServiceRole.entities.Resume.filter({ id: resumeId });
    const resume = resumes?.[0];

    if (!resume) {
      return Response.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.is_public) {
      return Response.json({ error: 'This resume is private' }, { status: 403 });
    }

    return Response.json({ resume });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});