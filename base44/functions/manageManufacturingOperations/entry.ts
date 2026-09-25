import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const JOB_TRANSITIONS = {
  draft: new Set(['assigned','cancelled']),
  assigned: new Set(['accepted','on_hold','cancelled']),
  accepted: new Set(['artwork_review','in_production','on_hold','cancelled']),
  artwork_review: new Set(['in_production','on_hold','cancelled']),
  in_production: new Set(['encoding','on_hold','cancelled']),
  encoding: new Set(['quality_control','on_hold','cancelled']),
  quality_control: new Set(['ready_to_ship','in_production','on_hold','cancelled']),
  ready_to_ship: new Set(['shipped','on_hold','cancelled']),
  shipped: new Set(['completed']),
  completed: new Set([]),
  on_hold: new Set(['assigned','accepted','artwork_review','in_production','encoding','quality_control','ready_to_ship','cancelled']),
  cancelled: new Set([]),
};

function safeString(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

async function audit(base44, user, action, targetType, targetId, targetName, oldValue, newValue, notes='') {
  try {
    await base44.asServiceRole.entities.AdminAuditLog.create({
      action,
      performed_by: user.id,
      performed_by_name: user.full_name || user.name || '',
      performed_by_email: user.email || '',
      target_type: targetType,
      target_id: targetId,
      target_name: targetName || targetId,
      old_value: JSON.stringify(oldValue || {}),
      new_value: JSON.stringify(newValue || {}),
      notes,
    });
  } catch (e) {
    console.error('Manufacturing audit failed (non-blocking):', e.message);
  }
}

async function ensureBackbone(base44, order, user) {
  if (!order || order.payment_status !== 'paid') throw new Error('Only paid orders can enter production.');
  if ((order.production_spec_ids || []).length > 0 && (order.production_job_ids || []).length > 0) {
    return { spec_ids: order.production_spec_ids, job_ids: order.production_job_ids, already_exists: true };
  }
  const items = Array.isArray(order.manufacturing_items) ? order.manufacturing_items : [];
  if (!items.length) throw new Error('This order has no manufacturing allocation yet.');
  const orderNumber = order.order_number || ('BC-' + String(order.id).slice(-8).toUpperCase());
  const specIds = [];
  const jobIds = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const line = String(index + 1).padStart(2, '0');
    const specNumber = `SPEC-${orderNumber}-${line}`;
    const jobNumber = `JOB-${orderNumber}-${line}`;
    let spec = (await base44.asServiceRole.entities.ProductionSpecification.filter({ spec_number: specNumber }, '-created_date', 1))?.[0];
    if (!spec) {
      spec = await base44.asServiceRole.entities.ProductionSpecification.create({
        spec_number: specNumber,
        shop_order_id: order.id,
        shop_order_number: orderNumber,
        version: 1,
        status: 'locked_for_production',
        product_sku: item.product_sku || '',
        product_type: item.product_type || 'card',
        quantity: Math.max(1, Number(item.quantity) || 1),
        finish: item.finish || 'Standard',
        logo_url: item.logo_url || '',
        design_snapshot: item.design_data || {},
        nfc_destination_policy: 'bingoo_device_redirect',
        qr_url_pattern: 'https://bingooconnect.com/d/{device_code}',
        encoding_instructions: 'Encode only the allocated permanent Bingoo /d/BG-###### URL. Never encode a customer profile URL directly.',
        packaging_instructions: 'Preserve device-code traceability through packaging and shipment.',
        customs_description: `Bingoo Connect NFC ${item.product_name || item.product_type || 'device'}`,
        locked_at: new Date().toISOString(),
        locked_by: user.id,
      });
    }
    specIds.push(spec.id);
    let job = (await base44.asServiceRole.entities.ProductionJob.filter({ job_number: jobNumber }, '-created_date', 1))?.[0];
    if (!job) {
      job = await base44.asServiceRole.entities.ProductionJob.create({
        job_number: jobNumber,
        shop_order_id: order.id,
        shop_order_number: orderNumber,
        production_spec_id: spec.id,
        status: 'draft',
        quantity: Math.max(1, Number(item.quantity) || 1),
        currency: 'USD',
        priority: 'standard',
        notes: 'Created from paid Bingoo Shop order. Awaiting facility assignment.',
      });
    }
    jobIds.push(job.id);
  }
  await base44.asServiceRole.entities.ShopOrder.update(order.id, {
    production_spec_ids: specIds,
    production_job_ids: jobIds,
    production_backbone_status: 'generated',
    production_backbone_generated_at: new Date().toISOString(),
  });
  await audit(base44, user, 'production_backbone_generated', 'ShopOrder', order.id, orderNumber, {}, { specIds, jobIds });
  return { spec_ids: specIds, job_ids: jobIds };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required.' }, { status: 403 });
    const body = await req.json();
    const action = safeString(body.action, 80);

    if (action === 'ensure_backbone') {
      const orderId = safeString(body.order_id, 120);
      const order = await base44.asServiceRole.entities.ShopOrder.get(orderId);
      if (!order) return Response.json({ error: 'Order not found.' }, { status: 404 });
      return Response.json({ success: true, ...(await ensureBackbone(base44, order, user)) });
    }

    if (action === 'create_partner') {
      const legalName = safeString(body.legal_name, 180);
      const countryCode = safeString(body.country_code, 2).toUpperCase();
      const currency = safeString(body.currency, 3).toUpperCase();
      if (!legalName || !/^[A-Z]{2}$/.test(countryCode) || !/^[A-Z]{3}$/.test(currency)) {
        return Response.json({ error: 'Legal name, ISO 2-letter country code and ISO 3-letter currency are required.' }, { status: 400 });
      }
      const existing = await base44.asServiceRole.entities.ManufacturingPartner.filter({ legal_name: legalName }, '-created_date', 1);
      if (existing.length) return Response.json({ error: 'A manufacturing partner with this legal name already exists.' }, { status: 409 });
      const count = (await base44.asServiceRole.entities.ManufacturingPartner.filter({}, '-created_date', 500)).length + 1;
      const partner = await base44.asServiceRole.entities.ManufacturingPartner.create({
        partner_code: `BP-${countryCode}-${String(count).padStart(3,'0')}`,
        legal_name: legalName,
        display_name: safeString(body.display_name || legalName, 180),
        status: 'pending_review',
        partner_type: safeString(body.partner_type, 40) || 'integrated',
        country_code: countryCode,
        region: safeString(body.region, 120),
        city: safeString(body.city, 120),
        currency,
        capabilities: Array.isArray(body.capabilities) ? body.capabilities.map(v => safeString(v,80)).filter(Boolean).slice(0,20) : [],
        supported_product_types: Array.isArray(body.supported_product_types) ? body.supported_product_types.map(v => safeString(v,60)).filter(Boolean).slice(0,30) : [],
        supported_shipping_countries: Array.isArray(body.supported_shipping_countries) ? body.supported_shipping_countries.map(v => safeString(v,2).toUpperCase()).filter(v => /^[A-Z]{2}$/.test(v)).slice(0,250) : [],
        nfc_encoding: Boolean(body.nfc_encoding),
        uv_printing: Boolean(body.uv_printing),
        laser_engraving: Boolean(body.laser_engraving),
        packaging: Boolean(body.packaging),
        min_order_quantity: Math.max(1, Number(body.min_order_quantity) || 1),
        lead_time_days_min: Math.max(0, Number(body.lead_time_days_min) || 0),
        lead_time_days_max: Math.max(0, Number(body.lead_time_days_max) || 0),
        contact_name: safeString(body.contact_name, 180),
        contact_email: safeString(body.contact_email, 254).toLowerCase(),
        contact_phone: safeString(body.contact_phone, 60),
        quality_standard: safeString(body.quality_standard, 250),
        notes: safeString(body.notes, 3000),
      });
      await audit(base44, user, 'manufacturing_partner_created', 'ManufacturingPartner', partner.id, partner.display_name, {}, partner, 'Partner starts pending_review.');
      return Response.json({ success: true, partner });
    }

    if (action === 'set_partner_status') {
      const partner = await base44.asServiceRole.entities.ManufacturingPartner.get(safeString(body.partner_id,120));
      if (!partner) return Response.json({ error: 'Partner not found.' }, { status: 404 });
      const next = safeString(body.status,40);
      if (!['pending_review','approved','suspended','inactive'].includes(next)) return Response.json({ error: 'Invalid partner status.' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.ManufacturingPartner.update(partner.id, { status: next });
      await audit(base44, user, 'manufacturing_partner_status', 'ManufacturingPartner', partner.id, partner.display_name, {status:partner.status}, {status:next});
      return Response.json({ success: true, partner: updated });
    }

    if (action === 'assign_partner') {
      const job = await base44.asServiceRole.entities.ProductionJob.get(safeString(body.job_id,120));
      const partner = await base44.asServiceRole.entities.ManufacturingPartner.get(safeString(body.partner_id,120));
      if (!job || !partner) return Response.json({ error: 'Production job or partner not found.' }, { status: 404 });
      if (partner.status !== 'approved') return Response.json({ error: 'Only approved manufacturing partners can receive production jobs.' }, { status: 409 });
      if (!['draft','on_hold','assigned'].includes(job.status)) return Response.json({ error: 'This production job can no longer be reassigned.' }, { status: 409 });
      const updated = await base44.asServiceRole.entities.ProductionJob.update(job.id, {
        partner_id: partner.id,
        partner_code: partner.partner_code,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      });
      await audit(base44, user, 'production_partner_assigned', 'ProductionJob', job.id, job.job_number, {partner_id:job.partner_id,status:job.status}, {partner_id:partner.id,partner_code:partner.partner_code,status:'assigned'});
      return Response.json({ success: true, job: updated });
    }

    if (action === 'transition_job') {
      const job = await base44.asServiceRole.entities.ProductionJob.get(safeString(body.job_id,120));
      if (!job) return Response.json({ error: 'Production job not found.' }, { status: 404 });
      const next = safeString(body.status,40);
      if (!JOB_TRANSITIONS[job.status]?.has(next)) return Response.json({ error: `Invalid production transition: ${job.status} → ${next}.` }, { status: 409 });
      const patch = { status: next };
      const now = new Date().toISOString();
      if (next === 'accepted') patch.accepted_at = now;
      if (next === 'in_production') patch.production_started_at = now;
      if (next === 'ready_to_ship') patch.ready_to_ship_at = now;
      if (next === 'completed') patch.completed_at = now;
      const updated = await base44.asServiceRole.entities.ProductionJob.update(job.id, patch);

      const order = await base44.asServiceRole.entities.ShopOrder.get(job.shop_order_id);
      if (order) {
        const orderPatch = {};
        if (next === 'in_production') orderPatch.manufacturing_status = 'in_production';
        if (next === 'encoding') orderPatch.manufacturing_status = 'programmed';
        if (next === 'ready_to_ship') {
          orderPatch.manufacturing_status = 'ready_to_ship';
          orderPatch.fulfillment_status = 'ready_to_ship';
        }
        if (next === 'shipped') {
          orderPatch.manufacturing_status = 'shipped';
          orderPatch.fulfillment_status = 'shipped';
          orderPatch.shipped_at = order.shipped_at || now;
        }
        if (Object.keys(orderPatch).length) await base44.asServiceRole.entities.ShopOrder.update(order.id, orderPatch);
      }
      await audit(base44, user, 'production_job_transition', 'ProductionJob', job.id, job.job_number, {status:job.status}, {status:next});
      return Response.json({ success: true, job: updated });
    }

    if (action === 'pass_qc') {
      const job = await base44.asServiceRole.entities.ProductionJob.get(safeString(body.job_id,120));
      if (!job) return Response.json({ error: 'Production job not found.' }, { status: 404 });
      if (job.status !== 'quality_control') return Response.json({ error: 'Job must be in quality_control before QC can pass.' }, { status: 409 });
      const order = await base44.asServiceRole.entities.ShopOrder.get(job.shop_order_id);
      const codes = Array.isArray(order?.assigned_device_codes) ? order.assigned_device_codes : [];
      if (!codes.length) return Response.json({ error: 'No allocated BG devices are available for QC.' }, { status: 409 });
      const existing = await base44.asServiceRole.entities.QualityControlRecord.filter({ production_job_id: job.id }, '-created_date', 500);
      const passedCodes = new Set(existing.filter(x => x.status === 'passed').map(x => x.device_code));
      const created = [];
      for (const code of codes) {
        if (passedCodes.has(code)) continue;
        const device = (await base44.asServiceRole.entities.NFCDevice.filter({ device_code: code }, '-created_date', 1))?.[0];
        const expected = `https://bingooconnect.com/d/${code}`;
        created.push(await base44.asServiceRole.entities.QualityControlRecord.create({
          qc_number: `QC-${job.job_number}-${code}`,
          production_job_id: job.id,
          shop_order_id: job.shop_order_id,
          device_id: device?.id || '',
          device_code: code,
          batch_number: job.batch_number || '',
          status: 'passed',
          print_check: true,
          artwork_check: true,
          nfc_write_check: true,
          nfc_read_check: true,
          qr_scan_check: true,
          redirect_check: true,
          packaging_check: true,
          expected_url: expected,
          observed_url: expected,
          inspected_by: user.id,
          inspected_at: new Date().toISOString(),
          notes: 'QC passed by authorized Bingoo admin. All mandatory checks attested.',
        }));
      }
      await base44.asServiceRole.entities.ProductionJob.update(job.id, { qc_completed_at: new Date().toISOString() });
      await audit(base44, user, 'production_qc_passed', 'ProductionJob', job.id, job.job_number, {}, {device_codes:codes});
      return Response.json({ success: true, created_count: created.length });
    }

    return Response.json({ error: 'Unsupported manufacturing action.' }, { status: 400 });
  } catch (error) {
    console.error('manageManufacturingOperations error:', error.message);
    return Response.json({ error: error.message || 'Manufacturing operation failed.' }, { status: 500 });
  }
});
