/*
 Regenerates public/sitemap.xml with static pages + all active product URLs.
*/

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = join(__dirname, '..');
const SITEMAP_PATH = join(FRONTEND_ROOT, 'public', 'sitemap.xml');
const ENV_PATH = join(FRONTEND_ROOT, '.env');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(ENV_PATH);

const SITE_URL = (process.env.VITE_SITE_URL || 'https://usjtechnologies.com').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in frontend/.env or the environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services', changefreq: 'monthly', priority: '0.9' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.9' },
  { loc: '/shop', changefreq: 'daily', priority: '0.95' },
  { loc: '/shop?brand=ENTER', changefreq: 'weekly', priority: '0.8' },
  { loc: '/shop?brand=TENDA', changefreq: 'weekly', priority: '0.8' },
  { loc: '/shop?brand=ZOOOK', changefreq: 'weekly', priority: '0.8' },
  { loc: '/certifications', changefreq: 'monthly', priority: '0.7' },
  { loc: '/ventures', changefreq: 'monthly', priority: '0.6' },
  { loc: '/projects', changefreq: 'monthly', priority: '0.6' },
  { loc: '/careers', changefreq: 'monthly', priority: '0.6' },
  { loc: '/quote-request', changefreq: 'monthly', priority: '0.7' },
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('is_active', true)
    .order('slug');

  if (error) {
    console.error('Supabase query failed:', error.message);
    process.exit(1);
  }

  return data ?? [];
}

async function main() {
  const today = formatDate(new Date());
  const products = await fetchProducts();

  const staticEntries = STATIC_PAGES.map((page) =>
    urlEntry({
      loc: `${SITE_URL}${page.loc}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    }),
  );

  const productEntries = products.map((product) => {
    const lastmod = product.updated_at || product.created_at;
    return urlEntry({
      loc: `${SITE_URL}/product/${product.slug}`,
      lastmod: lastmod ? formatDate(new Date(lastmod)) : today,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${staticEntries.join('\n\n')}

  <!-- Product pages (generated from Supabase) -->
${productEntries.join('\n')}

</urlset>
`;

  writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`Wrote ${STATIC_PAGES.length} static + ${products.length} product URLs to public/sitemap.xml`);
}

main();