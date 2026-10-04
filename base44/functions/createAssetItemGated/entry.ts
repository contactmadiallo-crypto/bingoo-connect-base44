import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveEffectivePlan } from '../../shared/entitlementResolver.ts';

const ALLOWED_TYPES = new Set(['pet','luggage','bag','keys','equipment','vehicle','other']);
// Free accounts do not include protected assets (Professional feature, available during the 14-day trial).
const FREE_ASSET_LIMIT = 0;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const data = body?.data || {};
    const name = String(data.name || '').trim();
    const assetType = ALLOWED_TYPES.has(data.asset_type) ? data.asset_type : 'other';
    if (!name) return Response.json({ error: 'Asset name is required' }, { status: 400 });

    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email }, '-updated_date', 20);
    const { plan } = resolveEffectivePlan(subs, user.email);
    const existing = await base44.asServiceRole.entities.AssetItem.filter({ owner_user_id: user.id }, '-created_date', 100);

    if (plan === 'free' && existing.length >= FREE_ASSET_LIMIT) {
      return Response.json({
        error: 'Protecting assets is a Professional feature. Start your 14-day Professional trial to add assets.',
        code: 'ASSET_LIMIT_REACHED',
        plan,
        limit: FREE_ASSET_LIMIT,
      }, { status: 403 });
    }

    const record = await base44.asServiceRole.entities.AssetItem.create({
      asset_type: assetType,
      name,
      photo_url: String(data.photo_url || ''),
      description: String(data.description || '').slice(0, 2000),
      nfc_device_id: '',
      lost_mode_enabled: Boolean(data.lost_mode_enabled),
      finder_message: String(data.finder_message || '').slice(0, 1000),
      recovery_instructions: String(data.recovery_instructions || '').slice(0, 1000),
      safe_contact_preference: ['phone','email','whatsapp','none'].includes(data.safe_contact_preference) ? data.safe_contact_preference : 'phone',
      reward_offered: String(data.reward_offered || '').slice(0, 500),
      public_medical_notes: String(data.public_medical_notes || '').slice(0, 1000),
      public_last_known_context: String(data.public_last_known_context || '').slice(0, 1000),
      owner_user_id: user.id,
    });

    return Response.json({ record, plan });
  } catch (error) {
    console.error('[createAssetItemGated]', error?.message || error);
    return Response.json({ error: 'Could not create asset' }, { status: 500 });
  }
});
