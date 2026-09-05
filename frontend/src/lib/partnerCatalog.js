import { supabase } from './supabase';

// Mirrors usj_partners_business_type_check (migration 20260906000007).
// Adding a value here without adding it to that constraint will fail the
// insert, so keep the two in step.
export const BUSINESS_TYPES = [
  { value: 'manufacturer',     label: 'Manufacturer',     hint: 'You make the products yourself' },
  { value: 'distributor',      label: 'Distributor',      hint: 'You hold stock for brands you represent' },
  { value: 'reseller',         label: 'Reseller',         hint: 'You buy and resell from distributors' },
  { value: 'importer',         label: 'Importer',         hint: 'You bring products in from overseas' },
  { value: 'system_integrator',label: 'System Integrator', hint: 'You bundle products into deployed solutions' },
];

// A manufacturer sells its own brand, so it has nobody to be authorised by.
// Everyone else is reselling someone else's brand and has to prove they may.
export const TYPES_NEEDING_AUTHORIZATION = ['distributor', 'reseller', 'importer'];

export const businessTypeLabel = (value) =>
  BUSINESS_TYPES.find((t) => t.value === value)?.label ?? null;

export const needsAuthorizationDocs = (businessType) =>
  TYPES_NEEDING_AUTHORIZATION.includes(businessType);

/** Active segments, ordered for display. Readable signed-out. */
export async function fetchPartnerCategories() {
  const { data, error } = await supabase
    .from('partner_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Segments one partner registered for.
 * Returns [] rather than throwing when the caller can't see the rows —
 * a pending applicant's segments are private, and the storefront and
 * admin list both render fine without them.
 */
export async function fetchPartnerCategoryLinks(partnerId) {
  if (!partnerId) return [];

  const { data, error } = await supabase
    .from('usj_partner_categories')
    .select('category_id, partner_categories ( id, name, slug )')
    .eq('partner_id', partnerId);

  if (error) {
    console.error('Failed to load partner segments:', error);
    return [];
  }

  return (data ?? []).map((row) => row.partner_categories).filter(Boolean);
}
