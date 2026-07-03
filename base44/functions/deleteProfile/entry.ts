import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Safe profile deletion:
//  - Verifies ownership (owner or admin only).
//  - mode "check": returns dependency summary (NFC devices, leads, appointments, other profiles) so
//    the UI can show what will happen before the user confirms.
//  - mode "delete": handles attached NFC devices per device_action (reassign | unassign), deletes
//    child records (leads, appointments, portfolio, team, offices, services), keeps analytics +
//    device audit history for support, then deletes the profile. NFC devices themselves are
//    NEVER deleted here — only re-pointed or unassigned.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { profile_id, mode = 'delete', device_action, reassign_to_profile_id } = body;
    if (!profile_id) return Response.json({ error: 'profile_id is required' }, { status: 400 });

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    // Ownership check — only the profile owner (or an admin) may delete.
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: you do not own this profile' }, { status: 403 });
    }

    // ── Gather dependencies (service role bypasses RLS for a reliable count) ──
    const [devices, leads, appts] = await Promise.all([
      base44.asServiceRole.entities.NFCDevice.filter({ profile_id }),
      base44.asServiceRole.entities.Lead.filter({ profile_id }),
      base44.asServiceRole.entities.Appointment.filter({ profile_id }),
    ]);

    // ── CHECK mode: return a summary for the confirmation modal ──
    if (mode === 'check') {
      const allProfiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: profile.created_by_id });
      const other_profiles = allProfiles
        .filter((p) => p.id !== profile_id)
        .map((p) => ({ id: p.id, display_name: p.display_name, username: p.username }));
      return Response.json({
        devices: devices.map((d) => ({ id: d.id, device_code: d.device_code, device_type: d.device_type, status: d.status })),
        device_count: devices.length,
        lead_count: leads.length,
        appointment_count: appts.length,
        other_profiles,
      });
    }

    // ── DELETE mode ──
    // 1. Handle attached NFC devices — never delete the device records themselves.
    if (devices.length > 0) {
      if (device_action === 'reassign') {
        if (!reassign_to_profile_id) {
          return Response.json({ error: 'reassign_to_profile_id is required for reassign action' }, { status: 400 });
        }
        const target = await base44.asServiceRole.entities.Profile.get(reassign_to_profile_id);
        if (!target || (target.created_by_id !== user.id && user.role !== 'admin')) {
          return Response.json({ error: 'Invalid reassign target profile' }, { status: 400 });
        }
        await base44.asServiceRole.entities.NFCDevice.bulkUpdate(
          devices.map((d) => ({
            id: d.id,
            profile_id: reassign_to_profile_id,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
          })),
        );
      } else if (device_action === 'unassign') {
        await base44.asServiceRole.entities.NFCDevice.bulkUpdate(
          devices.map((d) => ({
            id: d.id,
            profile_id: null,
            status: 'available',
            assigned_at: null,
          })),
        );
      } else {
        // Devices exist but no action specified — refuse to silently orphan them.
        return Response.json({
          error: 'Attached NFC devices require a device_action (reassign or unassign).',
          device_count: devices.length,
        }, { status: 409 });
      }
    }

    // 2. Delete child records owned by this profile. Analytics history is intentionally KEPT
    //    for admin/support audit. DeviceAuditLog is also kept.
    const [portfolio, practiceAreas, teamMembers, officeLocations, salonServices, legalServices, lostReports] = await Promise.all([
      base44.asServiceRole.entities.PortfolioItem.filter({ profile_id }),
      base44.asServiceRole.entities.PracticeArea.filter({ profile_id }),
      base44.asServiceRole.entities.TeamMember.filter({ profile_id }),
      base44.asServiceRole.entities.OfficeLocation.filter({ profile_id }),
      base44.asServiceRole.entities.SalonService.filter({ profile_id }),
      base44.asServiceRole.entities.LegalService.filter({ profile_id }),
      base44.asServiceRole.entities.LostItemReport.filter({ owner_profile_id: profile_id }),
    ]);

    const wipe = (entityName, query) =>
      base44.asServiceRole.entities[entityName].deleteMany(query).catch((e) => console.warn(`deleteMany ${entityName} failed:`, e.message));

    await Promise.all([
      leads.length && wipe('Lead', { profile_id }),
      appts.length && wipe('Appointment', { profile_id }),
      portfolio.length && wipe('PortfolioItem', { profile_id }),
      practiceAreas.length && wipe('PracticeArea', { profile_id }),
      teamMembers.length && wipe('TeamMember', { profile_id }),
      officeLocations.length && wipe('OfficeLocation', { profile_id }),
      salonServices.length && wipe('SalonService', { profile_id }),
      legalServices.length && wipe('LegalService', { profile_id }),
      lostReports.length && wipe('LostItemReport', { owner_profile_id: profile_id }),
    ]);

    // 3. Delete the profile itself (asServiceRole — Profile RLS delete is admin-only, but we
    //    already verified ownership above).
    await base44.asServiceRole.entities.Profile.delete(profile_id);

    return Response.json({
      success: true,
      deleted_profile_id: profile_id,
      devices_handled: devices.length,
      device_action,
    });
  } catch (error) {
    console.error('deleteProfile error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});