/**
 * Convert a string to a URL-friendly slug
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) =>
  str
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || '';
