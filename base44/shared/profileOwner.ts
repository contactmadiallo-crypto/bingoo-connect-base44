// Single source of truth for "who owns this profile" in backend functions.
//
// WHY: profiles created through createProfileGated are written with the service role, and the
// platform then stores the SERVICE identity ("service_...") in Profile.created_by_id. The real
// owner lives in ProfileAccess (profile_id -> owner_user_id, access_status 'active').
// Older profiles were created by the user directly, so created_by_id is the user there.
// This helper handles both: ProfileAccess first, created_by_id only when it is a real user id.

const isServiceId = (id: unknown): boolean => typeof id === 'string' && id.startsWith('service_');

export async function resolveProfileOwnerId(base44: any, profile: any): Promise<string | null> {
  if (!profile?.id) return null;
  try {
    const rows = await base44.asServiceRole.entities.ProfileAccess.filter(
      { profile_id: profile.id, access_status: 'active' },
      '-created_date',
      5,
    );
    const id = rows?.[0]?.owner_user_id;
    if (id && !isServiceId(id)) return id;
  } catch (e) {
    console.warn('resolveProfileOwnerId: ProfileAccess lookup failed, using created_by_id:', (e as Error)?.message);
  }
  const creator = profile.created_by_id;
  return creator && !isServiceId(creator) ? creator : null;
}

export async function isProfileOwner(base44: any, profile: any, user: any): Promise<boolean> {
  if (!user?.id) return false;
  return (await resolveProfileOwnerId(base44, profile)) === user.id;
}

/**
 * Every profile a user owns: profiles they created themselves (older profiles) plus profiles
 * where they hold an active ProfileAccess (all profiles created by the server function).
 * De-duplicated, full Profile records.
 */
export async function listOwnedProfiles(base44: any, userId: string): Promise<any[]> {
  if (!userId) return [];
  const sr = base44.asServiceRole.entities;
  const byId = new Map<string, any>();
  try {
    for (const p of await sr.Profile.filter({ created_by_id: userId })) byId.set(p.id, p);
  } catch (e) {
    console.warn('listOwnedProfiles: created_by_id lookup failed:', (e as Error)?.message);
  }
  try {
    const access = await sr.ProfileAccess.filter({ owner_user_id: userId, access_status: 'active' });
    for (const a of access || []) {
      if (!a?.profile_id || byId.has(a.profile_id)) continue;
      const p = await sr.Profile.get(a.profile_id).catch(() => null);
      if (p) byId.set(p.id, p);
    }
  } catch (e) {
    console.warn('listOwnedProfiles: ProfileAccess lookup failed:', (e as Error)?.message);
  }
  return [...byId.values()];
}
