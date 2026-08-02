import { base44 } from '@/api/base44Client';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const backendProvider = (import.meta.env.VITE_BACKEND_PROVIDER || 'base44').toLowerCase();

function normalizeSupabaseProfile(payload) {
  if (!payload) return null;

  const design = payload.design || {};
  const contact = payload.public_contact || {};

  return {
    ...payload,
    ...design,
    phone: payload.phone || contact.phone || null,
    whatsapp_number:
      payload.whatsapp_number || contact.whatsapp_number || contact.whatsapp || null,
    email: payload.email || contact.email || null,
    website: payload.website || contact.website || null,
    location: payload.location || contact.location || null,
    show_location: payload.show_location ?? contact.show_location ?? true,
    links: Array.isArray(payload.links) ? payload.links : [],
    is_active: true,
  };
}

async function getFromSupabase(username) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is selected but its public environment variables are missing.');
  }

  const { data, error } = await supabase.rpc('get_public_profile', {
    p_username: username,
  });

  if (error) throw error;

  const profile = normalizeSupabaseProfile(data);
  return { profile, not_found: !profile, provider: 'supabase' };
}

async function getFromBase44(username) {
  try {
    const res = await base44.functions.invoke('getPublicProfile', { username });
    if (res.status === 404 || res.data?.not_found) {
      return { profile: null, not_found: true, provider: 'base44' };
    }
    return {
      profile: res.data?.profile || null,
      not_found: !res.data?.profile,
      provider: 'base44',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { profile: null, not_found: true, provider: 'base44' };
    }
    throw error;
  }
}

export async function getPublicProfile(username) {
  const normalizedUsername = username?.trim().toLowerCase();
  if (!normalizedUsername) return { profile: null, not_found: true };

  if (backendProvider === 'supabase') {
    return getFromSupabase(normalizedUsername);
  }

  return getFromBase44(normalizedUsername);
}
