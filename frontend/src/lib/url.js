/**
 * Guards against javascript:/data: URLs sneaking into href/src attributes
 * from admin-editable fields (product_url, linkedin_url, etc).
 */
export function isSafeExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
