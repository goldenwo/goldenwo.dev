// src/privacy.mjs: personal data that must never ship. The repo and the site are both public.
// Shared by the data validator (src/data/validate.ts) and the post-build scan (scripts/privacy-scan.mjs).

/** @typedef {{ kind: 'email' | 'phone', count: number }} PrivateDataHit */

export const PRIVATE_PATTERNS = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  // Separators required: bare 10-digit runs would match numeric IDs, and résumés format phone numbers.
  phone: /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g,
};

/** Exact strings that match a pattern but are not private. Empty at launch. @type {readonly string[]} */
export const PRIVACY_ALLOWLIST = [];

/**
 * Counts email addresses and phone numbers in `text`. Returns counts only, never the matches: CI logs are public.
 * @param {string} text
 * @param {readonly string[]} [allowlist]
 * @returns {PrivateDataHit[]}
 */
export function findPrivateData(text, allowlist = PRIVACY_ALLOWLIST) {
  /** @type {PrivateDataHit[]} */
  const hits = [];
  for (const kind of /** @type {const} */ (['email', 'phone'])) {
    const count = (text.match(PRIVATE_PATTERNS[kind]) ?? []).filter((m) => !allowlist.includes(m)).length;
    if (count > 0) hits.push({ kind, count });
  }
  return hits;
}
