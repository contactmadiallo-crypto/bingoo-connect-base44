import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { dry_run = true, subscriptions = [] } = body;

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return Response.json({ error: 'No subscriptions provided' }, { status: 400 });
    }

    const report = [];

    for (const sub of subscriptions) {
      const {
        customer_email,
        customer_name,
        stripe_customer_id,
        stripe_subscription_id,
        plan,
        status,
        product,
      } = sub;

      const entry = {
        input: { customer_email, customer_name, stripe_subscription_id, stripe_customer_id, plan, status, product },
        existing_subscription: null,
        existing_subscription_match_by: null,
        duplicate_risk: false,
        matched_user: null,
        matched_profile: null,
        profile_plan_already_paid: false,
        profile_plan_would_change: false,
        action: null,
        subscription_activity_would_create: null,
        executed: false,
        error: null,
      };

      try {
        // ── 1. Check existing Subscription records ──────────────────
        const allSubs = await base44.asServiceRole.entities.Subscription.list();

        const bySubId = allSubs.find(s => s.stripe_subscription_id === stripe_subscription_id);
        const byEmail = allSubs.find(s => s.customer_email?.toLowerCase() === customer_email?.toLowerCase());

        if (bySubId) {
          entry.existing_subscription = { id: bySubId.id, customer_email: bySubId.customer_email, plan: bySubId.plan, status: bySubId.status };
          entry.existing_subscription_match_by = 'stripe_subscription_id';
          entry.action = 'update';
        } else if (byEmail) {
          entry.existing_subscription = { id: byEmail.id, customer_email: byEmail.customer_email, plan: byEmail.plan, status: byEmail.status };
          entry.existing_subscription_match_by = 'customer_email';
          entry.duplicate_risk = byEmail.stripe_subscription_id && byEmail.stripe_subscription_id !== stripe_subscription_id;
          entry.action = 'update';
        } else {
          entry.action = 'create';
        }

        // ── 2. Find matching User ───────────────────────────────────
        const allUsers = await base44.asServiceRole.entities.User.list();
        const matchedUser = allUsers.find(u => u.email?.toLowerCase() === customer_email?.toLowerCase());
        if (matchedUser) {
          entry.matched_user = { id: matchedUser.id, email: matchedUser.email, full_name: matchedUser.full_name };
        }

        // ── 3. Find matching Profile ───────────────────────────────
        const allProfiles = await base44.asServiceRole.entities.Profile.list();
        let matchedProfile = null;

        if (matchedUser) {
          matchedProfile = allProfiles.find(p =>
            p.created_by_id === matchedUser.id ||
            (Array.isArray(matchedUser.owned_profile_ids) && matchedUser.owned_profile_ids.includes(p.id))
          );
        }
        if (!matchedProfile) {
          matchedProfile = allProfiles.find(p => p.email?.toLowerCase() === customer_email?.toLowerCase());
        }

        if (matchedProfile) {
          const alreadyPaid = matchedProfile.plan && matchedProfile.plan !== 'free';
          entry.matched_profile = {
            id: matchedProfile.id,
            username: matchedProfile.username,
            display_name: matchedProfile.display_name,
            current_plan: matchedProfile.plan || 'free',
            email_on_profile: matchedProfile.email,
          };
          entry.profile_plan_already_paid = alreadyPaid;
          entry.profile_plan_would_change = !alreadyPaid;
        }

        // ── 4. SubscriptionActivity preview ───────────────────────
        entry.subscription_activity_would_create = {
          customer_email,
          customer_name,
          plan,
          action: entry.action === 'create' ? 'created' : 'backfilled',
          status,
          stripe_subscription_id,
          details: 'Backfilled from Stripe dashboard because webhook deliveries were missing.',
          activity_date: new Date().toISOString(),
        };

        // ── 5. Execute if not dry_run ─────────────────────────────
        if (!dry_run) {
          const subPayload = {
            customer_email,
            customer_name: customer_name || '',
            plan,
            status,
            stripe_customer_id: stripe_customer_id || '',
            stripe_subscription_id: stripe_subscription_id || '',
            cancel_at_period_end: false,
          };

          if (entry.action === 'update' && entry.existing_subscription?.id) {
            await base44.asServiceRole.entities.Subscription.update(entry.existing_subscription.id, subPayload);
          } else {
            await base44.asServiceRole.entities.Subscription.create(subPayload);
          }

          // Update Profile.plan only if it's currently free or missing
          if (matchedProfile && !entry.profile_plan_already_paid) {
            await base44.asServiceRole.entities.Profile.update(matchedProfile.id, { plan });
            entry.profile_plan_would_change = true;
          }

          // Create SubscriptionActivity
          await base44.asServiceRole.entities.SubscriptionActivity.create(entry.subscription_activity_would_create);

          entry.executed = true;
        }

      } catch (err) {
        entry.error = err.message;
        console.error(`Error processing ${customer_email}:`, err.message);
      }

      report.push(entry);
    }

    return Response.json({
      dry_run,
      processed: report.length,
      summary: report.map(r => ({
        customer_email: r.input.customer_email,
        action: r.action,
        existing_match_by: r.existing_subscription_match_by,
        duplicate_risk: r.duplicate_risk,
        matched_user: r.matched_user?.email || null,
        matched_profile_username: r.matched_profile?.username || null,
        profile_current_plan: r.matched_profile?.current_plan || null,
        profile_plan_already_paid: r.profile_plan_already_paid,
        profile_plan_would_change: r.profile_plan_would_change,
        executed: r.executed,
        error: r.error,
      })),
      detail: report,
    });

  } catch (error) {
    console.error('backfillStripeSubscriptions error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});