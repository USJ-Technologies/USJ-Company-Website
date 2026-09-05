/**
 * One definition per rule, shared by every form.
 *
 * These were previously re-declared per page and had drifted: four different
 * email regexes, two phone rules, and several forms with no checks at all.
 */

// `.[^\s@]+` accepted "a@b.c" — a 2+ character TLD is the cheap fix that
// rejects a typo without pretending to fully parse RFC 5322.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Indian mobile: 10 digits starting 6-9.
export const PHONE_RE = /^[6-9]\d{9}$/;

// GSTIN: 15 alphanumeric — 22AAAAA0000A1Z5
//   2-digit state code | 10-char PAN | entity number | fixed 'Z' | checksum
export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// 4-letter bank code, a fixed 0, then a 6-character branch code.
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
// Indian account numbers run 9-18 digits depending on the bank.
export const BANK_ACCOUNT_RE = /^\d{9,18}$/;

/**
 * People paste numbers with +91, a leading 0, spaces, dashes or brackets.
 * Stripping all of it first means a valid number is never rejected over
 * formatting.
 */
export const normalizePhone = (v) =>
  String(v ?? '')
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?91/, '')
    .replace(/^0/, '');

export const isEmail = (v) => EMAIL_RE.test(String(v ?? '').trim());
export const isPhone = (v) => PHONE_RE.test(normalizePhone(v));
export const isGstin = (v) => GSTIN_RE.test(String(v ?? '').replace(/\s/g, '').toUpperCase());
export const isPan = (v) => PAN_RE.test(String(v ?? '').replace(/\s/g, '').toUpperCase());
export const isIfsc = (v) => IFSC_RE.test(String(v ?? '').trim().toUpperCase());
export const isBankAccount = (v) => BANK_ACCOUNT_RE.test(String(v ?? '').replace(/[\s-]/g, ''));

/**
 * Characters 3-12 of a GSTIN are the holder's PAN. Comparing them catches a
 * transposed character that either format would accept on its own.
 */
export const gstinMatchesPan = (gstin, pan) =>
  String(gstin ?? '').replace(/\s/g, '').toUpperCase().slice(2, 12) ===
  String(pan ?? '').replace(/\s/g, '').toUpperCase();

/**
 * startsWith('http') also accepts "httpfoo" and "http:garbage". Parsing is the
 * only way to actually know, and URL() throws rather than returning null.
 */
export const isHttpUrl = (v) => {
  try {
    const u = new URL(String(v ?? '').trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/** A positive amount of money, rejecting negatives, NaN and Infinity. */
export const isPositiveAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

/** A whole number within an inclusive range. */
export const isIntegerInRange = (v, min, max) =>
  /^\d+$/.test(String(v)) && Number(v) >= min && Number(v) <= max;
