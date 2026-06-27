import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

async function listWithRetry(bucket, prefix, offset, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (!error) return data;
    lastErr = error;
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error(`list(${bucket}/${prefix}) failed after retries: ${lastErr.message}`);
}

async function listAll(bucket, prefix = '') {
  let totalBytes = 0;
  let count = 0;
  let pngBytes = 0;
  let pngCount = 0;
  let offset = 0;
  for (;;) {
    const data = await listWithRetry(bucket, prefix, offset);
    if (!data.length) break;
    for (const entry of data) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        const sub = await listAll(bucket, fullPath);
        totalBytes += sub.totalBytes;
        count += sub.count;
        pngBytes += sub.pngBytes;
        pngCount += sub.pngCount;
      } else {
        const size = entry.metadata?.size ?? 0;
        totalBytes += size;
        count++;
        if (/\.png$/i.test(entry.name)) {
          pngBytes += size;
          pngCount++;
        }
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return { totalBytes, count, pngBytes, pngCount };
}

const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) throw bErr;
console.log(`Buckets: ${buckets.map((b) => b.name).join(', ')}\n`);

let grandTotal = 0;
for (const b of buckets) {
  const { totalBytes, count, pngBytes, pngCount } = await listAll(b.name);
  grandTotal += totalBytes;
  console.log(`── ${b.name} ──`);
  console.log(`  Objects: ${count}`);
  console.log(`  PNGs:    ${pngCount} (${(pngBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  Total:   ${(totalBytes / 1024 / 1024).toFixed(2)} MB\n`);
}
console.log(`GRAND TOTAL across all buckets: ${(grandTotal / 1024 / 1024).toFixed(2)} MB`);
