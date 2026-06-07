import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Cleanup duplicate profiles for each user.
 * Keeps the most recently updated profile, deletes older duplicates.
 * Admin-only function.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all profiles
    const allProfiles = await base44.asServiceRole.entities.Profile.filter({});

    // Group by creator
    const byCreator = {};
    for (const profile of allProfiles) {
      if (!byCreator[profile.created_by_id]) {
        byCreator[profile.created_by_id] = [];
      }
      byCreator[profile.created_by_id].push(profile);
    }

    const deletedIds = [];
    let totalDeleted = 0;

    // For each user, keep newest, delete older duplicates
    for (const [creatorId, profiles] of Object.entries(byCreator)) {
      if (profiles.length <= 1) continue;

      // Sort by updated_date descending (most recent first)
      profiles.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

      // Keep first (newest), delete rest
      const toKeep = profiles[0];
      const toDelete = profiles.slice(1);

      for (const profile of toDelete) {
        try {
          await base44.asServiceRole.entities.Profile.delete(profile.id);
          deletedIds.push({ id: profile.id, username: profile.username, created: profile.created_date });
          totalDeleted++;
          console.log(`Deleted duplicate profile: ${profile.id} (${profile.username}), kept: ${toKeep.id}`);
        } catch (err) {
          console.error(`Failed to delete profile ${profile.id}:`, err.message);
        }
      }
    }

    return Response.json({
      success: true,
      totalProcessed: allProfiles.length,
      totalDeleted,
      deletedProfiles: deletedIds,
    });
  } catch (error) {
    console.error('cleanupDuplicateProfiles error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});