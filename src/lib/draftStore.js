// Design Studio draft storage — mirrors cartStore.js pattern.
// Uses localStorage only (existing browser behavior); no entity/RLS/backend changes.

const DRAFTS_KEY = 'bingoo_design_drafts';
const MAX_DRAFTS = 20;

export function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDraft(draft) {
  const drafts = getDrafts();
  const newDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  drafts.unshift(newDraft);
  if (drafts.length > MAX_DRAFTS) drafts.length = MAX_DRAFTS;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return newDraft;
}

export function deleteDraft(id) {
  const drafts = getDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}