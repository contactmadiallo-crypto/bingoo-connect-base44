import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * exportMyData — returns ONLY the authenticated user's own data.
 *
 * Why this is a backend function (and not client-side entity reads):
 *  - Client reads were capped at 500 rows and silently truncated the export.
 *  - NFCDevice.list() returned every device for admins, so an admin's export contained other
 *    customers' devices.
 *  - Scoping is enforced here with the user's id/email, never with a client-supplied value.
 *  - Secrets and long-lived private file URLs are deliberately not included.
 */

const PAGE = 500;
const MAX_ROWS = 5000;

async function fetchAll(entity: any, query: Record<string, unknown>, sort = '-created_date') {
  const rows: any[] = [];
  for (let skip = 0; skip < MAX_ROWS; skip += PAGE) {
    // SDK filter(query, sort, limit, skip)
    const page = await entity.filter(query, sort, PAGE, skip);
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

function pick(obj: any, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
  return out;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.id || !user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole.entities;
    const email = String(user.email).toLowerCase();

    const profiles = await fetchAll(sr.Profile, { created_by_id: user.id });
    const profileIds = new Set(profiles.map((p: any) => p.id));

    const [devicesByAccount, assets, savedConnections, subscriptions, orders, walletItems, activity] = await Promise.all([
      fetchAll(sr.NFCDevice, { account_id: user.id }),
      fetchAll(sr.AssetItem, { owner_user_id: user.id }),
      fetchAll(sr.SavedConnection, { created_by_id: user.id }),
      fetchAll(sr.Subscription, { customer_email: user.email }),
      fetchAll(sr.ShopOrder, { customer_email: user.email }),
      fetchAll(sr.DocumentWalletItem, { owner_user_id: user.id }),
      fetchAll(sr.ActivityLog, { user_id: user.id }, '-timestamp'),
    ]);

    // Leads / appointments are queried per owned profile (server-side, no row cap truncation).
    const perProfile = async (entity: any) => {
      const all: any[] = [];
      for (const id of profileIds) all.push(...await fetchAll(entity, { profile_id: id }));
      return all;
    };
    const [leads, appointments] = await Promise.all([perProfile(sr.Lead), perProfile(sr.Appointment)]);

    const exportData = {
      format_version: 1,
      exported_at: new Date().toISOString(),
      account: pick(user, ['id', 'email', 'full_name', 'role', 'account_type', 'business_type', 'preferred_language', 'preferred_region']),
      profiles,
      nfc_devices: devicesByAccount.map((d: any) => pick(d, ['device_code', 'device_type', 'product_name', 'status', 'profile_id', 'assigned_asset_id', 'assigned_at', 'created_date'])),
      protected_assets: assets,
      leads,
      appointments,
      saved_connections: savedConnections,
      subscriptions: subscriptions.map((s: any) => pick(s, ['plan', 'status', 'plan_source', 'current_period_end', 'cancel_at_period_end', 'created_date'])),
      shop_orders: orders.map((o: any) => pick(o, ['order_number', 'items', 'subtotal', 'shipping_cost', 'total', 'payment_status', 'fulfillment_status', 'tracking_number', 'created_date'])),
      // Metadata only: private document files stay in the Document Wallet and are not copied into a portable file.
      document_wallet: walletItems.map((d: any) => pick(d, ['file_name', 'document_type', 'expiration_date', 'visibility', 'created_date'])),
      activity_log: activity.map((a: any) => pick(a, ['action', 'description', 'timestamp'])),
    };

    // Audit trail (server-side, cannot be skipped by the client)
    await sr.ActivityLog.create({
      user_id: user.id,
      user_email: email,
      action: 'data_exported',
      description: 'User downloaded their personal data archive',
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    return Response.json({ success: true, data: exportData });
  } catch (error) {
    console.error('[exportMyData]', (error as Error)?.message || error);
    return Response.json({ error: 'Could not prepare your data export' }, { status: 500 });
  }
});
