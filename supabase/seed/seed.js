/**
 * USJ Technologies — Product Seed Script
 *
 * Reads the three brand product JSON files, uploads local images to
 * Supabase Storage, then inserts brands / categories / products /
 * product_images rows into Supabase PostgreSQL.
 *
 * Usage:
 *   cd supabase/seed && npm install
 *   cp .env.example .env          # fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
 *   npm run seed                  # all three brands
 *   npm run seed:enter            # only ENTER
 *   npm run seed:tenda            # only TENDA
 *   npm run seed:zoook            # only ZOOOK (also seeds static content)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, join, basename } from 'path';
import 'dotenv/config';

// ── Supabase client (service role — bypasses RLS) ────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const STORAGE_BUCKET = 'product-images';

// Root of the monorepo (two dirs up from supabase/seed/)
const REPO_ROOT = resolve(import.meta.dirname, '../../');

// ── Helpers ───────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, maxAttempts = 4, baseDelayMs = 2000) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s
        console.warn(`  ↺ Retry ${attempt}/${maxAttempts - 1} after ${delay}ms (${err.message})`);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

// ── Slugify helper ────────────────────────────────────────────
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Upload one image file to Supabase Storage (with retry) ───
async function uploadImage(localRelPath, storagePath) {
  const absolutePath = join(REPO_ROOT, localRelPath.replace(/\\/g, '/'));
  if (!existsSync(absolutePath)) return null;

  const fileBuffer = readFileSync(absolutePath);
  const ext = basename(absolutePath).split('.').pop().toLowerCase();
  const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';

  try {
    return await withRetry(async () => {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
      return data.publicUrl;
    });
  } catch (err) {
    console.warn(`  ⚠ Storage upload failed for ${storagePath}: ${err.message}`);
    return null;
  }
}

// ── Ensure brand exists, return its id ───────────────────────
async function upsertBrand(name) {
  const slug = slugify(name);
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('brands')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) throw new Error(`Brand upsert failed: ${error.message}`);
    return data.id;
  });
}

// ── Ensure category exists for a brand, return its id ────────
const categoryCache = new Map(); // "brandId::slug" → id

async function upsertCategory(name, brandId) {
  const slug = slugify(name);
  const cacheKey = `${brandId}::${slug}`;
  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey);

  const id = await withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name, slug, brand_id: brandId }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) throw new Error(`Category upsert failed for "${name}": ${error.message}`);
    return data.id;
  });
  categoryCache.set(cacheKey, id);
  return id;
}

// ════════════════════════════════════════════════════════════
// ENTER brand seeder (141 products)
// ════════════════════════════════════════════════════════════
async function seedEnter() {
  console.log('\n🔵 Seeding ENTER products...');
  const jsonPath = join(REPO_ROOT, 'enter_images/products.json');
  const products = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const brandId = await upsertBrand('ENTER');
  let inserted = 0;
  let skipped = 0;

  for (const p of products) {
    const slug = p.slug || slugify(p.name);
    const categoryId = await upsertCategory(p.category || 'General', brandId);

    const uploadedImages = [];
    const imagePaths = p.local_images?.length ? p.local_images : (p.local_listing_image ? [p.local_listing_image] : []);

    for (let i = 0; i < imagePaths.length; i++) {
      if (i > 0) await sleep(80);
      const storagePath = `enter/${slugify(p.category)}/${slug}/${i === 0 ? 'main' : `img-${i}`}.png`;
      const url = await uploadImage(imagePaths[i], storagePath);
      if (url) uploadedImages.push({ url, is_primary: i === 0, display_order: i });
    }

    const primaryImageUrl = uploadedImages[0]?.url || p.listing_image || null;

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .upsert({
        slug,
        name: p.name,
        model: p.model || null,
        description: p.description || null,
        brand_id: brandId,
        brand_name: 'ENTER',
        category_id: categoryId,
        category_name: p.category,
        specifications: p.specifications && Object.keys(p.specifications).length ? p.specifications : {},
        key_features: Array.isArray(p.key_features) ? p.key_features.filter(Boolean) : [],
        in_box: [],
        product_url: p.product_url || null,
        primary_image_url: primaryImageUrl,
        is_active: true,
        is_featured: false,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (prodErr) {
      console.warn(`  ⚠ Product skip "${p.name}": ${prodErr.message}`);
      skipped++;
      continue;
    }

    if (uploadedImages.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', product.id);
      await supabase.from('product_images').insert(
        uploadedImages.map((img) => ({ ...img, product_id: product.id }))
      );
    }

    inserted++;
    if (inserted % 10 === 0) console.log(`  ✓ ENTER: ${inserted}/${products.length}`);
  }

  console.log(`  ✅ ENTER done — ${inserted} inserted, ${skipped} skipped`);
}

// ════════════════════════════════════════════════════════════
// TENDA brand seeder (136 products)
// ════════════════════════════════════════════════════════════
async function seedTenda() {
  console.log('\n🟢 Seeding TENDA products...');
  const jsonPath = join(REPO_ROOT, 'tenda_images/products.json');
  const products = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const brandId = await upsertBrand('TENDA');
  let inserted = 0;
  let skipped = 0;

  for (const p of products) {
    const slug = `tenda-${slugify(p.model || p.name)}`;
    const categoryId = await upsertCategory(p.category || 'General', brandId);

    let primaryImageUrl = null;
    if (p.local_image) {
      const storagePath = `tenda/${slugify(p.category)}/${slugify(p.model || p.name)}.png`;
      primaryImageUrl = await uploadImage(p.local_image, storagePath);
    }
    if (!primaryImageUrl) primaryImageUrl = p.image_url || null;

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .upsert({
        slug,
        name: p.name,
        model: p.model || null,
        description: p.description || null,
        brand_id: brandId,
        brand_name: 'TENDA',
        category_id: categoryId,
        category_name: p.category,
        specifications: {},
        key_features: [],
        in_box: [],
        product_url: p.product_url || null,
        primary_image_url: primaryImageUrl,
        is_active: true,
        is_featured: false,
        is_b2b: true,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (prodErr) {
      console.warn(`  ⚠ Product skip "${p.name}": ${prodErr.message}`);
      skipped++;
      continue;
    }

    if (primaryImageUrl) {
      await supabase.from('product_images').delete().eq('product_id', product.id);
      await supabase.from('product_images').insert({
        product_id: product.id,
        url: primaryImageUrl,
        is_primary: true,
        display_order: 0,
      });
    }

    inserted++;
    if (inserted % 10 === 0) console.log(`  ✓ TENDA: ${inserted}/${products.length}`);
  }

  console.log(`  ✅ TENDA done — ${inserted} inserted, ${skipped} skipped`);
}

// ════════════════════════════════════════════════════════════
// ZOOOK brand seeder (439 products — most complete data)
// ════════════════════════════════════════════════════════════
async function seedZoook() {
  console.log('\n🟡 Seeding ZOOOK products...');
  const jsonPath = join(REPO_ROOT, 'zoook_images/products.json');
  const products = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const brandId = await upsertBrand('ZOOOK');
  let inserted = 0;
  let skipped = 0;

  for (let idx = 0; idx < products.length; idx++) {
    const p = products[idx];

    // Wrap each product in its own try/catch so one failure never aborts the batch
    try {
      const slug = `zoook-${slugify(p.slug || p.name)}`;
      const categoryId = await upsertCategory(p.category || 'General', brandId);

      const uploadedImages = [];
      const imagePaths = p.local_images?.length ? p.local_images : (p.local_listing_image ? [p.local_listing_image] : []);

      for (let i = 0; i < imagePaths.length; i++) {
        if (i > 0) await sleep(100); // throttle to avoid rate limits
        const storagePath = `zoook/${slugify(p.category)}/${slugify(p.slug || p.name)}/${i === 0 ? 'main' : `img-${i}`}.png`;
        const url = await uploadImage(imagePaths[i], storagePath);
        if (url) uploadedImages.push({ url, is_primary: i === 0, display_order: i });
      }

      const primaryImageUrl = uploadedImages[0]?.url || p.listing_image || null;

      const { data: product, error: prodErr } = await withRetry(async () => {
        const result = await supabase
          .from('products')
          .upsert({
            slug,
            name: p.name,
            model: null,
            description: p.description || null,
            brand_id: brandId,
            brand_name: 'ZOOOK',
            category_id: categoryId,
            category_name: p.category,
            specifications: p.specifications && typeof p.specifications === 'object' ? p.specifications : {},
            key_features: Array.isArray(p.key_features) ? p.key_features.filter(Boolean) : [],
            in_box: Array.isArray(p.in_box) ? p.in_box.filter(Boolean) : [],
            product_url: p.product_url || null,
            primary_image_url: primaryImageUrl,
            is_active: true,
            is_featured: false,
          }, { onConflict: 'slug' })
          .select('id')
          .single();
        if (result.error) throw new Error(result.error.message);
        return result;
      });

      if (prodErr) {
        console.warn(`  ⚠ Product skip "${p.name}": ${prodErr.message}`);
        skipped++;
        continue;
      }

      if (uploadedImages.length > 0) {
        await supabase.from('product_images').delete().eq('product_id', product.id);
        await supabase.from('product_images').insert(
          uploadedImages.map((img) => ({ ...img, product_id: product.id }))
        );
      }

      inserted++;
      if (inserted % 20 === 0) console.log(`  ✓ ZOOOK: ${inserted}/${products.length} (index ${idx})`);

      // Brief pause every 50 products to let connections breathe
      if (idx > 0 && idx % 50 === 0) {
        console.log(`  ⏳ Pausing 3s at product ${idx} to avoid rate limits...`);
        await sleep(3000);
      }
    } catch (err) {
      console.warn(`  ⚠ ZOOOK product[${idx}] "${p.name}" failed: ${err.message}`);
      skipped++;
    }
  }

  console.log(`  ✅ ZOOOK done — ${inserted} inserted, ${skipped} skipped`);
}

// ── Seed static content (ventures, certifications) ───────────
async function seedStaticContent() {
  console.log('\n📋 Seeding static content...');

  const ventures = [
    {
      name: 'Bail & Beyond Law Chambers',
      tagline: 'Expert Legal Services for Bail & Criminal Matters',
      description: 'Professional legal services specializing in bail applications, criminal defense, and legal consultation across Uttarakhand.',
      website_url: 'https://bailandbeyond.com',
      category: 'Legal Services',
      status: 'live',
      is_revealed: true,
      display_order: 1,
    },
    {
      name: 'Doon Travelers',
      tagline: 'Discover the Beauty of Uttarakhand',
      description: 'Your trusted travel partner for exploring the Garhwal Himalayas, pilgrimage tours, and adventure expeditions across Uttarakhand.',
      website_url: 'https://doontravelers.com',
      category: 'Travel & Tourism',
      status: 'live',
      is_revealed: true,
      display_order: 2,
    },
    {
      name: 'Coming Soon',
      tagline: 'Something Exciting is Being Built',
      description: 'Our next venture is in stealth mode. Stay tuned for an exciting announcement.',
      website_url: null,
      category: 'TBD',
      status: 'coming_soon',
      is_revealed: false,
      display_order: 3,
    },
  ];

  const { error: ventureError } = await supabase
    .from('ventures')
    .upsert(ventures, { onConflict: 'name' });
  if (ventureError) console.warn(`  ⚠ Ventures: ${ventureError.message}`);
  else console.log('  ✓ Ventures seeded');

  const certifications = [
    {
      name: 'Startup India Recognized',
      issuing_body: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
      description: 'Recognized under the Startup India initiative by the Government of India.',
      is_visible: true,
      display_order: 1,
    },
    {
      name: 'GeM Registered Seller',
      issuing_body: 'Government e-Marketplace (GeM)',
      description: 'Registered seller on GeM portal for government procurement of technology products.',
      is_visible: true,
      display_order: 2,
    },
    {
      name: 'MSME Registered',
      issuing_body: 'Ministry of Micro, Small and Medium Enterprises',
      description: 'Udyam Registration for Micro, Small and Medium Enterprise.',
      is_visible: true,
      display_order: 3,
    },
  ];

  const { error: certError } = await supabase
    .from('certifications')
    .upsert(certifications, { onConflict: 'name' });
  if (certError) console.warn(`  ⚠ Certifications: ${certError.message}`);
  else console.log('  ✓ Certifications seeded');
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  const brandArg = process.argv.find((a) => a.startsWith('--brand='));
  const onlyBrand = brandArg ? brandArg.split('=')[1].toLowerCase() : null;

  console.log('🚀 USJ Technologies — Product Seed Script');
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`   Storage bucket: ${STORAGE_BUCKET}`);
  if (onlyBrand) console.log(`   Seeding only: ${onlyBrand.toUpperCase()}`);

  // Ensure Storage bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (error) {
      console.error(`❌ Could not create storage bucket "${STORAGE_BUCKET}": ${error.message}`);
      process.exit(1);
    }
    console.log(`  ✓ Created public storage bucket: ${STORAGE_BUCKET}`);
  }

  const start = Date.now();

  if (!onlyBrand || onlyBrand === 'enter') await seedEnter();
  if (!onlyBrand || onlyBrand === 'tenda') await seedTenda();
  if (!onlyBrand || onlyBrand === 'zoook') await seedZoook();

  // Always seed static content (idempotent upserts)
  await seedStaticContent();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Seeding complete in ${elapsed}s`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
