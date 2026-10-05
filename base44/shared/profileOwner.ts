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
