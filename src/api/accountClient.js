import { base44 } from "@/api/base44Client";

const adapters = new Map();

const base44AccountAdapter = {
  async getCurrentAccount() {
    return base44.auth.me();
  },
  async updateCurrentAccount(fields) {
    return base44.auth.updateMe(fields);
  },
  async logout() {
    return base44.auth.logout();
  },
};

adapters.set("base44", base44AccountAdapter);

export const getBackendProvider = () =>
  (import.meta.env.VITE_BACKEND_PROVIDER || "base44").toLowerCase();

export function registerAccountAdapter(name, adapter) {
  if (!name || !adapter) return;
  adapters.set(String(name).toLowerCase(), adapter);
}

function getAdapter() {
  const provider = getBackendProvider();
  return adapters.get(provider) || adapters.get("base44");
}

export function normalizeAccount(account) {
  if (!account) return null;
  return {
    ...account,
    id: account.id,
    full_name: account.full_name || account.name || account.email || "Bingoo User",
    email: account.email || "",
    avatar_url: account.avatar_url || account.profile_image || account.photo_url || "",
    role: account.role || "user",
  };
}

export async function getCurrentAccount() {
  return normalizeAccount(await getAdapter().getCurrentAccount());
}

export async function updateCurrentAccount(fields) {
  const adapter = getAdapter();
  if (!adapter.updateCurrentAccount) {
    throw new Error("The active account provider does not support account updates.");
  }
  return normalizeAccount(await adapter.updateCurrentAccount(fields));
}

export async function logoutAccount() {
  return getAdapter().logout();
}
