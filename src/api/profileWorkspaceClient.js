import { base44 } from "@/api/base44Client";
import { getBackendProvider } from "@/api/accountClient";

const adapters = new Map();

const base44ProfileWorkspaceAdapter = {
  async listAccessibleProfiles() {
    const response = await base44.functions.invoke("getMyProfiles", {});
    return response?.data?.profiles || [];
  },
};

adapters.set("base44", base44ProfileWorkspaceAdapter);

export function registerProfileWorkspaceAdapter(name, adapter) {
  if (!name || !adapter) return;
  adapters.set(String(name).toLowerCase(), adapter);
}

function getAdapter() {
  const provider = getBackendProvider();
  return adapters.get(provider) || adapters.get("base44");
}

export function getProfileStatus(profile) {
  if (!profile) return "inactive";
  if (profile.access_status === "trial_locked" || profile.access_status === "locked") return "locked";
  if (profile.access_status === "archived") return "archived";
  if (profile.is_active === false) return "inactive";
  if (profile.visible === false) return "hidden";
  return "live";
}

export function normalizeAccessibleProfile(profile) {
  if (!profile) return null;
  const accessRole = profile.access_role || profile.member_role || profile.role || "owner";
  return {
    ...profile,
    id: profile.id || profile.profile_id,
    access_role: accessRole,
    access_status: profile.access_status || "active",
    is_primary: profile.is_primary === true,
    profile_status: getProfileStatus(profile),
    can_edit: accessRole === "owner" || accessRole === "editor",
  };
}

export async function listAccessibleProfiles() {
  const rows = await getAdapter().listAccessibleProfiles();
  return (rows || []).map(normalizeAccessibleProfile).filter((profile) => profile?.id);
}
