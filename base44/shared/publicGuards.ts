// Shared guards for unauthenticated (public) backend functions.
// There is no IP / CAPTCHA primitive available here, so throttling is DB-backed:
// count recent records the endpoint itself created. It fails OPEN on query errors so a
// transient failure never blocks a real visitor.

export function clip(value: unknown, max = 200): string {
  if (value == null) return '';
  return String(value).trim().slice(0, max);
}

export function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * True when `entity` already holds >= `max` records matching `filter` created within `windowMs`.
 * `entity` is e.g. base44.asServiceRole.entities.Lead.
 */
export async function exceedsRate(
  entity: { filter: (q: Record<string, unknown>, sort?: string, limit?: number) => Promise<any[]> },
  filter: Record<string, unknown>,
  max: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const rows = await entity.filter(filter, '-created_date', max);
    const cutoff = Date.now() - windowMs;
    const recent = rows.filter((r) => new Date(r.created_date).getTime() >= cutoff);
    return recent.length >= max;
  } catch (e) {
    console.error('exceedsRate check failed (fail-open):', (e as Error)?.message);
    return false;
  }
}

export const TOO_MANY_REQUESTS = { error: 'Too many requests. Please try again in a few minutes.' };
