/**
 * Supabase query helpers for the USJ Technologies storefront.
 * All functions return { data, error } — callers decide how to handle errors.
 */

import { supabase } from './supabase';

const PAGE_SIZE = 24;

// ── Products ─────────────────────────────────────────────────

export async function getProducts({
  page = 1,
  limit = PAGE_SIZE,
  search = '',
  brand = '',
  category = '',
  isB2B,
  isFeatured,
} = {}) {
  let query = supabase
    .from('products')
    .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured, model', { count: 'exact' })
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (brand) {
    query = query.eq('brand_name', brand);
  }
  if (category) {
    query = query.eq('category_name', category);
  }
  if (isB2B !== undefined) {
    query = query.eq('is_b2b', isB2B);
  }
  if (isFeatured) {
    query = query.eq('is_featured', true);
  }

  return query;
}

export async function getProductBySlug(slug) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) return { data: null, error };

  // Fetch images separately for the detail view
  const { data: images } = await supabase
    .from('product_images')
    .select('url, is_primary, display_order')
    .eq('product_id', product.id)
    .order('display_order');

  return { data: { ...product, images: images ?? [] }, error: null };
}

export async function getFeaturedProducts(limit = 8) {
  const { data: featured } = await supabase
    .from('products')
    .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (featured?.length > 0) return { data: featured, error: null };

  // Fallback: most recently added active products
  return supabase
    .from('products')
    .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured')
    .eq('is_active', true)
    .limit(limit)
    .order('created_at', { ascending: false });
}

// ── Brands & Categories ───────────────────────────────────────

export async function getBrands() {
  return supabase.from('brands').select('id, name, slug').order('name');
}

export async function getCategoriesByBrand(brandName) {
  let query = supabase
    .from('categories')
    .select('id, name, slug, brand_id')
    .eq('is_active', true)
    .order('name');

  if (brandName) {
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brandName)
      .single();
    if (brand) query = query.eq('brand_id', brand.id);
  }

  return query;
}

export async function getAllCategories() {
  return supabase
    .from('categories')
    .select('id, name, slug, brand_id, brands(name)')
    .eq('is_active', true)
    .order('name');
}

// ── Ventures / Certifications / Projects ─────────────────────

export async function getVentures() {
  return supabase.from('ventures').select('*').eq('is_active', true).order('display_order');
}

export async function getCertifications() {
  return supabase.from('certifications').select('*').eq('is_visible', true).order('display_order');
}

export async function getProjects() {
  return supabase.from('projects').select('*').eq('is_active', true).order('display_order');
}

// ── Cart (server-side for signed-in users) ───────────────────

export async function getCartFromDb(userId) {
  return supabase
    .from('cart_items')
    .select('id, quantity, product_id, products(id, name, slug, primary_image_url, brand_name, category_name, is_b2b, model)')
    .eq('user_id', userId);
}

export async function upsertCartItem(userId, productId, quantity) {
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    return supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();
  }

  return supabase
    .from('cart_items')
    .insert({ user_id: userId, product_id: productId, quantity })
    .select()
    .single();
}

export async function updateCartItemQty(userId, productId, quantity) {
  if (quantity < 1) {
    return supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  }
  return supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId);
}

export async function removeCartItem(userId, productId) {
  return supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
}

export async function clearCart(userId) {
  return supabase.from('cart_items').delete().eq('user_id', userId);
}

// ── Smart / Personalized Products ────────────────────────────

export function trackProductView(userId, productId, brandName, categoryName) {
  if (!userId || !productId) return;
  supabase
    .from('user_product_views')
    .insert({ user_id: userId, product_id: productId, brand_name: brandName ?? null, category_name: categoryName ?? null })
    .then(() => {});
}

async function getUserPreferences(userId) {
  const { data } = await supabase
    .from('user_product_views')
    .select('brand_name, category_name')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(40);

  if (!data?.length) return { topBrands: [], topCategories: [] };

  const brandCount = {};
  const catCount = {};
  for (const { brand_name, category_name } of data) {
    if (brand_name) brandCount[brand_name] = (brandCount[brand_name] || 0) + 1;
    if (category_name) catCount[category_name] = (catCount[category_name] || 0) + 1;
  }

  const topBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  return { topBrands, topCategories };
}

export async function getSmartProducts(userId = null, limit = 8) {
  // Pull a larger pool of high-value products: B2B first, then featured, then recent
  const { data: pool, error } = await supabase
    .from('products')
    .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured')
    .eq('is_active', true)
    .order('is_b2b', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(80);

  if (error || !pool?.length) return { data: [], error };

  if (!userId) {
    // Guests: shuffle to show variety, but the pool is already B2B-weighted
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return { data: shuffled.slice(0, limit), error: null };
  }

  const { topBrands, topCategories } = await getUserPreferences(userId);

  if (!topBrands.length && !topCategories.length) {
    // Registered but no history yet — shuffle the high-value pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return { data: shuffled.slice(0, limit), error: null };
  }

  // Score each product by activity match + value signals
  const scored = pool.map((p) => {
    let score = 0;
    if (p.is_b2b) score += 4;
    if (p.is_featured) score += 2;

    const bi = topBrands.indexOf(p.brand_name);
    if (bi >= 0) score += (3 - bi) * 6; // +18, +12, +6

    const ci = topCategories.indexOf(p.category_name);
    if (ci >= 0) score += (5 - ci) * 3; // +15, +12, +9, +6, +3

    // Small random jitter so same score products don't always appear in same order
    score += Math.random() * 1.5;
    return { ...p, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  return { data: scored.slice(0, limit).map(({ _score, ...p }) => p), error: null };
}

export async function getRecommendedForUser(userId, limit = 4) {
  if (!userId) return { data: [], error: null };

  const { topBrands, topCategories } = await getUserPreferences(userId);
  if (!topBrands.length && !topCategories.length) return { data: [], error: null };

  // Products the user has recently looked at — exclude these from recommendations
  const { data: recentViews } = await supabase
    .from('user_product_views')
    .select('product_id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(15);
  const excludeIds = new Set(recentViews?.map((v) => v.product_id) ?? []);

  // Fetch products from preferred brands OR categories
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured')
    .eq('is_active', true)
    .in('brand_name', topBrands.length ? topBrands : ['__none__'])
    .order('is_b2b', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30);

  let candidates = (data ?? []).filter((p) => !excludeIds.has(p.id));

  // If brand match didn't return enough, supplement with category matches
  if (candidates.length < limit && topCategories.length) {
    const { data: catData } = await supabase
      .from('products')
      .select('id, name, slug, brand_name, category_name, primary_image_url, is_b2b, is_featured')
      .eq('is_active', true)
      .in('category_name', topCategories.slice(0, 3))
      .order('is_b2b', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    const extra = (catData ?? []).filter(
      (p) => !excludeIds.has(p.id) && !candidates.find((c) => c.id === p.id)
    );
    candidates = [...candidates, ...extra];
  }

  if (!candidates.length) return { data: [], error: null };

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return { data: shuffled.slice(0, limit), error: null };
}

// ── Quote Requests ────────────────────────────────────────────

export async function submitQuoteRequest({ userId, name, email, phone, organization, message, items }) {
  // 1. Insert the quote request
  const { data: quote, error: quoteError } = await supabase
    .from('quote_requests')
    .insert({
      user_id: userId ?? null,
      name,
      email,
      phone: phone || null,
      organization: organization || null,
      message: message || null,
    })
    .select('id, reference_number')
    .single();

  if (quoteError) return { data: null, error: quoteError };

  // 2. Insert all quote line items
  const lineItems = items.map((item) => ({
    quote_id: quote.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_sku: item.product.model ?? null,
    brand_name: item.product.brand_name ?? null,
    image_url: item.product.primary_image_url ?? null,
    quantity: item.qty,
  }));

  const { error: itemsError } = await supabase.from('quote_items').insert(lineItems);
  if (itemsError) return { data: null, error: itemsError };

  // 3. Trigger Edge Function for emails (fire-and-forget; don't block on failure)
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    await fetch(`${supabaseUrl}/functions/v1/send-quote-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_number: quote.reference_number,
        name,
        email,
        phone,
        organization,
        message,
        items: lineItems,
      }),
    });
  } catch {
    // Email failure is non-fatal; quote was already saved
  }

  return { data: quote, error: null };
}
