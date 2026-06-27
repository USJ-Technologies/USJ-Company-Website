/**
 * USJ Technologies — Repoint DB image URLs from .png to .webp
 *
 * Companion to compress-images.js. Run this AFTER that script has finished
 * converting every PNG in the "product-images" bucket to WebP, so that DB
 * columns referencing the old .png public URLs point at the new .webp files
 * instead.
 *
 * Usage:
 *   cd supabase/seed && npm install
 *   npm run fix-image-urls -- --dry-run   # preview, no writes
 *   npm run fix-image-urls                # full run
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const DRY_RUN = process.argv.includes('--dry-run');

// Every table/column known to store a public storage URL for the
// "product-images" bucket.
const URL_REFERENCES = [
  { table: 'products', column: 'primary_image_url', pk: 'id' },
  { table: 'product_images', column: 'url', pk: 'id' },
  { table: 'categories', column: 'image_url', pk: 'id' },
  { table: 'brands', column: 'logo_url', pk: 'id' },
  { table: 'ventures', column: 'logo_url', pk: 'id' },
  { table: 'certifications', column: 'image_url', pk: 'id' },
  { table: 'projects', column: 'image_url', pk: 'id' },
  { table: 'team_members', column: 'image_url', pk: 'id' },
  { table: 'quote_items', column: 'image_url', pk: 'id' },
];

const PAGE_SIZE = 1000;
const CONCURRENCY = 10;

async function runPool(items, worker, concurrency) {
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
}

async function fixTable({ table, column, pk }) {
  let updated = 0;
  let from = 0;
  const rowsToUpdate = [];

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(`${pk}, ${column}`)
      .ilike(column, '%.png')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`select on ${table}.${column} failed: ${error.message}`);
    if (!data.length) break;

    for (const row of data) {
      rowsToUpdate.push({ [pk]: row[pk], [column]: row[column].replace(/\.png$/i, '.webp') });
    }
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (!rowsToUpdate.length) return 0;

  if (DRY_RUN) {
    console.log(`[dry-run] ${table}.${column}: ${rowsToUpdate.length} row(s) would be updated`);
    return rowsToUpdate.length;
  }

  const failures = [];
  await runPool(rowsToUpdate, async (row) => {
    const { [pk]: id, [column]: newValue } = row;
    const { error } = await supabase.from(table).update({ [column]: newValue }).eq(pk, id);
    if (error) {
      failures.push(`${id}: ${error.message}`);
      return;
    }
    updated++;
  }, CONCURRENCY);

  console.log(`✓ ${table}.${column}: ${updated}/${rowsToUpdate.length} row(s) updated`);
  if (failures.length) {
    console.error(`  ${failures.length} failure(s) on ${table}.${column}:`);
    for (const f of failures.slice(0, 10)) console.error(`    ${f}`);
  }
  return updated;
}

async function main() {
  console.log(`Repointing .png -> .webp URLs across ${URL_REFERENCES.length} table column(s)...${DRY_RUN ? ' [DRY RUN]' : ''}`);
  let total = 0;
  for (const ref of URL_REFERENCES) {
    try {
      total += await fixTable(ref);
    } catch (err) {
      console.error(`✗ ${ref.table}.${ref.column}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${total} row(s) ${DRY_RUN ? 'would be' : 'were'} updated.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
