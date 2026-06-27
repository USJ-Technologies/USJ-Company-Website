/**
 * USJ Technologies — Storage Image Compression Script
 *
 * Converts every PNG in the "product-images" bucket to WebP (resized to a
 * max width) then deletes the original PNG to reclaim storage space.
 *
 * This script only touches Storage. Once it has finished, the DB columns
 * that reference these files (products.primary_image_url, product_images.url,
 * etc.) still point at the old .png URLs — run the companion SQL migration
 * (rename_png_urls_to_webp) to repoint them in bulk.
 *
 * Usage:
 *   cd supabase/seed && npm install
 *   cp .env.example .env              # fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
 *   npm run compress-images -- --dry-run --limit=20   # preview, no writes
 *   npm run compress-images                           # full run
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const BUCKET = 'product-images';
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1600;
const CONCURRENCY = 3;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, maxAttempts = 5, baseDelayMs = 1500) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) await sleep(baseDelayMs * attempt);
    }
  }
  throw lastErr;
}

async function listAllPngFiles(prefix = '') {
  const out = [];
  const data = await withRetry(async () => {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
    if (error) throw new Error(`list(${prefix}) failed: ${error.message}`);
    return data;
  });
  for (const entry of data) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      out.push(...(await listAllPngFiles(fullPath)));
    } else if (/\.png$/i.test(entry.name)) {
      out.push({ path: fullPath });
    }
  }
  return out;
}

async function processFile(file, stats) {
  const { path } = file;
  const webpPath = path.replace(/\.png$/i, '.webp');

  const blob = await withRetry(async () => {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) throw new Error(`download failed: ${error.message}`);
    return data;
  });
  const inputBuffer = Buffer.from(await blob.arrayBuffer());

  const outputBuffer = await sharp(inputBuffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  stats.before += inputBuffer.length;
  stats.after += outputBuffer.length;

  if (DRY_RUN) {
    console.log(`[dry-run] ${path} (${inputBuffer.length}B) -> ${webpPath} (${outputBuffer.length}B)`);
    stats.converted++;
    return;
  }

  await withRetry(async () => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(webpPath, outputBuffer, { contentType: 'image/webp', upsert: true });
    if (error) throw new Error(`upload failed: ${error.message}`);
  });

  await withRetry(async () => {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(`delete original failed: ${error.message}`);
  });

  stats.converted++;
  console.log(`✓ ${path} -> ${webpPath}  ${inputBuffer.length}B -> ${outputBuffer.length}B`);
}

async function runPool(items, worker, concurrency) {
  const stats = { converted: 0, failed: 0, before: 0, after: 0 };
  const failures = [];
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      try {
        await worker(items[idx], stats);
      } catch (err) {
        stats.failed++;
        failures.push({ path: items[idx].path, error: err.message });
        console.error(`✗ ${items[idx].path}: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return { stats, failures };
}

async function main() {
  console.log(`Scanning bucket "${BUCKET}" for PNG files...`);
  const allFiles = await listAllPngFiles();
  const files = allFiles.slice(0, LIMIT);
  console.log(
    `Found ${allFiles.length} PNG file(s)${LIMIT < Infinity ? `, processing first ${files.length}` : ''}.${DRY_RUN ? ' [DRY RUN — no writes]' : ''}`
  );

  const { stats, failures } = await runPool(files, processFile, CONCURRENCY);

  console.log('\n── Summary ───────────────────────');
  console.log(`Converted: ${stats.converted}/${files.length}`);
  console.log(`Failed:    ${stats.failed}`);
  console.log(
    `Size:      ${(stats.before / 1024 / 1024).toFixed(2)} MB -> ${(stats.after / 1024 / 1024).toFixed(2)} MB` +
      (stats.before ? ` (${(100 - (stats.after / stats.before) * 100).toFixed(1)}% smaller)` : '')
  );
  if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  ${f.path}: ${f.error}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
