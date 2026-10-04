/**
 * notifyOwner — single entry point for owner-facing notifications.
 *
 * Does two things for one event:
 *   1. Creates the durable in-app BingooNotification (source of truth, shown in the notification center).
 *   2. Sends a best-effort Web Push through `sendPushNotification`.
 *
 * Both are written in the OWNER's language (User.preferred_language), so a French-speaking owner
 * no longer receives English alerts. Failures never throw: a notification problem must not break
 * lead / booking / lost-item flows.
 */

type Lang = 'en' | 'fr';
type Vars = Record<string, string | number | null | undefined>;
type Rendered = { title: string; body: string };

const s = (v: unknown, fallback = '') => (v == null || v === '' ? fallback : String(v));

const TEMPLATES: Record<string, { emoji: string; en: (v: Vars) => Rendered; fr: (v: Vars) => Rendered }> = {
  new_lead: {
    emoji: '⭐',
    en: (v) => ({
      title: `New lead from ${s(v.name, 'Someone')}`,
      body: s(v.message) || (v.phone ? `📞 ${v.phone}` : s(v.email, 'Tap to view details')),
    }),
    fr: (v) => ({
      title: `Nouveau prospect : ${s(v.name, 'Quelqu’un')}`,
      body: s(v.message) || (v.phone ? `📞 ${v.phone}` : s(v.email, 'Touchez pour voir les détails')),
    }),
  },
  new_prospect: {
    emoji: '✨',
    en: (v) => ({
      title: `New prospect from ${s(v.name, 'Someone')}`,
      body: `Interested in: ${s(v.interest)}${v.email ? ` · ${v.email}` : ''}`,
    }),
    fr: (v) => ({
      title: `Nouveau contact : ${s(v.name, 'Quelqu’un')}`,
      body: `Intéressé par : ${s(v.interest)}${v.email ? ` · ${v.email}` : ''}`,
    }),
  },
  new_appointment: {
    emoji: '📅',
    en: (v) => ({
      title: `New booking from ${s(v.name, 'a visitor')}`,
      body: s(v.when) ? `${v.when}${v.service ? ` · ${v.service}` : ''}` : 'Tap to review the booking',
    }),
    fr: (v) => ({
      title: `Nouvelle réservation de ${s(v.name, 'un visiteur')}`,
      body: s(v.when) ? `${v.when}${v.service ? ` · ${v.service}` : ''}` : 'Touchez pour consulter la réservation',
    }),
  },
  lost_scan: {
    emoji: '📍',
    en: (v) => ({
      title: `Lost item scanned: ${s(v.identifier)}`,
      body: `Someone just scanned your lost ${s(v.label, 'item')}${v.assetName ? ` (${v.assetName})` : ''} assigned to ${s(v.target, 'you')}.${v.hasLocation ? ' Location shared.' : ''}`,
    }),
    fr: (v) => ({
      title: `Objet perdu scanné : ${s(v.identifier)}`,
      body: `Quelqu’un vient de scanner votre ${s(v.label, 'objet')} perdu${v.assetName ? ` (${v.assetName})` : ''} associé à ${s(v.target, 'vous')}.${v.hasLocation ? ' Position partagée.' : ''}`,
    }),
  },
  finder_report: {
    emoji: '🙏',
    en: (v) => ({
      title: `Finder report for ${s(v.identifier)}`,
      body: `${s(v.finder, 'A finder')} submitted a report for your ${s(v.label, 'item')}${v.assetName ? ` (${v.assetName})` : ''} assigned to ${s(v.target, 'their item')}.${v.hasLocation ? ' Location shared.' : ''}`,
    }),
    fr: (v) => ({
      title: `Rapport d’un découvreur pour ${s(v.identifier)}`,
      body: `${s(v.finder, 'Un découvreur')} a soumis un rapport pour votre ${s(v.label, 'objet')}${v.assetName ? ` (${v.assetName})` : ''} associé à ${s(v.target, 'cet objet')}.${v.hasLocation ? ' Position partagée.' : ''}`,
    }),
  },
  payment_failed: {
    emoji: '⚠️',
    en: () => ({ title: 'Payment failed', body: 'We could not process your last payment. Update your payment method to keep your plan active.' }),
    fr: () => ({ title: 'Échec du paiement', body: 'Nous n’avons pas pu traiter votre dernier paiement. Mettez à jour votre moyen de paiement pour conserver votre forfait.' }),
  },
  subscription_canceled: {
    emoji: 'ℹ️',
    en: () => ({ title: 'Subscription ended', body: 'Your paid plan has ended. Your account is back on Free; paid tools are locked until you resubscribe.' }),
    fr: () => ({ title: 'Abonnement terminé', body: 'Votre forfait payant est terminé. Votre compte repasse en Gratuit ; les outils payants sont verrouillés jusqu’à un nouvel abonnement.' }),
  },
};

export type NotifyOptions = {
  userId?: string | null;
  profileId?: string | null;
  /** BingooNotification.event_type enum value */
  eventType: string;
  /** Key in TEMPLATES (defaults to eventType) */
  template?: string;
  vars?: Vars;
  actionUrl?: string;
  relatedId?: string | null;
  actorName?: string;
  /** Set false to only create the in-app record */
  push?: boolean;
};

export async function ownerLanguage(base44: any, userId: string): Promise<Lang> {
  try {
    const user = await base44.asServiceRole.entities.User.get(userId);
    return user?.preferred_language === 'fr' ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

export async function notifyOwner(base44: any, opts: NotifyOptions): Promise<{ inApp: boolean; push: boolean }> {
  const result = { inApp: false, push: false };
  // A notification without an owner can never be shown (BingooNotification.user_id is required + RLS-scoped).
  if (!opts.userId) return result;

  const tpl = TEMPLATES[opts.template || opts.eventType];
  if (!tpl) {
    console.error('[notifyOwner] unknown template', opts.template || opts.eventType);
    return result;
  }
  const lang = await ownerLanguage(base44, opts.userId);
  const { title, body } = tpl[lang](opts.vars || {});

  try {
    await base44.asServiceRole.entities.BingooNotification.create({
      user_id: opts.userId,
      profile_id: opts.profileId || null,
      event_type: opts.eventType,
      title,
      message: body,
      is_read: false,
      action_url: opts.actionUrl || '/bingoo',
      related_id: opts.relatedId || null,
      actor_name: opts.actorName || '',
    });
    result.inApp = true;
  } catch (e) {
    console.error('[notifyOwner] in-app create failed (non-blocking):', (e as Error).message);
  }

  if (opts.push !== false) {
    try {
      await base44.asServiceRole.functions.invoke('sendPushNotification', {
        user_id: opts.userId,
        title: `${tpl.emoji} ${title}`,
        body,
        url: opts.actionUrl || '/bingoo',
        _internalToken: Deno.env.get('VAPID_PRIVATE_KEY'),
      });
      result.push = true;
    } catch (e) {
      console.error('[notifyOwner] push failed (non-blocking):', (e as Error).message);
    }
  }
  return result;
}
