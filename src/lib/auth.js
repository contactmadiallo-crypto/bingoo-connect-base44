/**
 * Bingoo Connect — Shared Auth & Role Utilities
 *
 * Single source of truth for admin/role checks across the app.
 * All components should use these helpers instead of scattered
 * `user?.role === "admin"` checks.
 *
 * Account model:
 *   - One account (User) can own many profiles, assets, and NFC devices.
 *   - Profiles are NOT separate accounts — they belong to a User.
 *   - The account owns the subscription/billing entitlement.
 *   - Roles: user, business_owner, team_member, admin.
 *   - Admin is a ROLE, not a plan.
 */

/**
 * Returns true if the user has admin privileges.
 * Admin is a ROLE, not a plan. Only users with role "admin"
 * (or legacy "super_admin") are considered admins.
 *
 * @param {object|null} user - user object from base44.auth.me()
 * @returns {boolean}
 */
export function isAdminUser(user) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

/**
 * Returns the user's role, defaulting to "user".
 * @param {object|null} user
 * @returns {string} - "admin" | "user" | "business_owner" | "team_member"
 */
export function getUserRole(user) {
  return user?.role || 'user';
}

/**
 * Returns true if the user is a business owner.
 */
export function isBusinessOwner(user) {
  return user?.role === 'business_owner';
}

/**
 * Returns true if the user is a team member.
 */
export function isTeamMember(user) {
  return user?.role === 'team_member';
}

/**
 * Returns true if the user can manage the given profile.
 * Admins can manage any profile. Owners can manage their own.
 *
 * @param {object|null} user
 * @param {object|null} profile - profile entity
 * @param {string[]} [ownedProfileIds] - from user.owned_profile_ids
 * @returns {boolean}
 */
export function canManageProfile(user, profile, ownedProfileIds) {
  if (isAdminUser(user)) return true;
  if (!profile) return false;
  if (profile.created_by_id === user?.id) return true;
  const ids = ownedProfileIds || user?.owned_profile_ids || [];
  if (Array.isArray(ids) && ids.includes(profile.id)) return true;
  return false;
}

/**
 * Returns the profile IDs owned by a user (from user data or provided list).
 */
export function getOwnedProfileIds(user) {
  return user?.owned_profile_ids || [];
}