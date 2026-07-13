import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * verifyOwnership — Server-side ownership verification.
 *
 * Checks if the authenticated user owns a given record.
 * Admins are considered owners of all records.
 *
 * This function is the server-side authority for ownership checks.
 * It must agree with the RLS rules defined on each entity.
 *
 * Payload: { entity_name, entity_id }
 * Returns: { owned: boolean, record: object|null, error: string|null }
 *
 * Supported entities: Profile, AssetItem, NFCDevice, DocumentWalletItem,
 *   Lead, Appointment, ShopOrder, Subscription, SupportTicket
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { entity_name, entity_id } = body;

    if (!entity_name || !entity_id) {
      return Response.json({ error: 'entity_name and entity_id are required' }, { status: 400 });
    }

    const ALLOWED = new Set([
      'Profile', 'AssetItem', 'NFCDevice', 'DocumentWalletItem',
      'Lead', 'Appointment', 'ShopOrder', 'Subscription', 'SupportTicket',
    ]);
    if (!ALLOWED.has(entity_name)) {
      return Response.json({ error: 'Entity type not supported' }, { status: 400 });
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const entities = base44.asServiceRole.entities;

    // Fetch record with service role (bypasses RLS for admin/ownership check)
    let record;
    try {
      switch (entity_name) {
        case 'Profile': record = await entities.Profile.get(entity_id); break;
        case 'AssetItem': record = await entities.AssetItem.get(entity_id); break;
        case 'NFCDevice': record = await entities.NFCDevice.get(entity_id); break;
        case 'DocumentWalletItem': record = await entities.DocumentWalletItem.get(entity_id); break;
        case 'Lead': record = await entities.Lead.get(entity_id); break;
        case 'Appointment': record = await entities.Appointment.get(entity_id); break;
        case 'ShopOrder': record = await entities.ShopOrder.get(entity_id); break;
        case 'Subscription': record = await entities.Subscription.get(entity_id); break;
        case 'SupportTicket': record = await entities.SupportTicket.get(entity_id); break;
      }
    } catch (e) {
      return Response.json({ owned: false, record: null, error: 'Record not found' });
    }

    if (!record) {
      return Response.json({ owned: false, record: null, error: 'Record not found' });
    }

    // Admin owns everything
    if (isAdmin) {
      return Response.json({ owned: true, record });
    }

    // ── Ownership rules (must match RLS on each entity) ──
    const ownedProfileIds = user.owned_profile_ids || [];
    let owned = false;

    if (entity_name === 'Profile') {
      owned = record.created_by_id === user.id ||
        (Array.isArray(ownedProfileIds) && ownedProfileIds.includes(entity_id));
    } else if (entity_name === 'AssetItem' || entity_name === 'DocumentWalletItem') {
      owned = record.owner_user_id === user.id;
    } else if (entity_name === 'NFCDevice') {
      // Device owned via profile_id → check profile belongs to user
      if (record.profile_id) {
        owned = Array.isArray(ownedProfileIds) && ownedProfileIds.includes(record.profile_id);
      }
      // Fallback: check via assigned asset ownership
      if (!owned && record.assigned_asset_id) {
        try {
          const asset = await entities.AssetItem.get(record.assigned_asset_id);
          owned = asset?.owner_user_id === user.id;
        } catch { /* ignore */ }
      }
    } else if (entity_name === 'Lead') {
      if (record.profile_id) {
        owned = Array.isArray(ownedProfileIds) && ownedProfileIds.includes(record.profile_id);
      }
    } else if (entity_name === 'Appointment') {
      // Owner via profile, owner_user_id, or visitor_email
      if (record.profile_id) {
        owned = Array.isArray(ownedProfileIds) && ownedProfileIds.includes(record.profile_id);
      }
      if (!owned) owned = record.owner_user_id === user.id;
      if (!owned) owned = record.visitor_email === user.email;
    } else if (entity_name === 'ShopOrder') {
      owned = record.customer_email === user.email || record.created_by_id === user.id;
    } else if (entity_name === 'Subscription') {
      owned = record.customer_email === user.email;
    } else if (entity_name === 'SupportTicket') {
      owned = record.user_id === user.id;
    }

    console.log('[verifyOwnership]', {
      user: user.email,
      role: user.role,
      entity_name,
      entity_id,
      owned,
    });

    return Response.json({ owned, record });
  } catch (error) {
    console.error('verifyOwnership error:', error);
    return Response.json({ owned: false, record: null, error: error.message }, { status: 500 });
  }
});