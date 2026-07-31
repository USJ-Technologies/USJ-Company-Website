/*
 * Serverless OG-tag renderer for product pages.
 *
 * WHY THIS EXISTS
 * ---------------
 * The site is a client-rendered React SPA. Social crawlers (WhatsApp, Facebook,
 * LinkedIn, Telegram, X/Twitter, Slack, Discord, ...) do NOT execute JavaScript,
 * so the per-product <meta og:image> that react-helmet-async sets at runtime is
 * never seen — crawlers only read the static index.html, which hardcodes the
 * organisation's og-image.jpeg. As a result every shared product link showed the
 * org image instead of the product image.
 *
 * vercel.json rewrites ONLY crawler requests (matched by User-Agent) for
 * /product/:slug and /shop/product/:slug to this function. Real users keep hitting
 * the fast static index.html. This function fetches the product from Supabase and
 * returns the base HTML with product-specific OG/Twitter tags injected.
 */

const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.usjtechnologies.com').replace(/\/$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpeg`;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteImage(url) {
  if (!url) return DEFAULT_OG_IMAGE;
  let abs = url;
  if (url.startsWith('http://')) abs = url.replace('http://', 'https://');
  else if (!url.startsWith('https://')) abs = `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  return toShareableImage(abs);
}

/*
 * Social scrapers (esp. WhatsApp) don't render WebP link-preview images, so a
 * .webp product photo shows no image at all. Supabase Storage can transcode on
 * the fly via its render/image endpoint, which returns JPEG. Rewrite Supabase
 * public object URLs to that endpoint (sized for a preview card); leave any
 * other/non-Supabase or already-JPEG/PNG URLs untouched.
 */
function toShareableImage(url) {
  const isSupabaseObject = url.includes('/storage/v1/object/public/');
  const isWebpOrAvif = /\.(webp|avif)(\?|$)/i.test(url);
  if (isSupabaseObject && isWebpOrAvif) {
    const rendered = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const sep = rendered.includes('?') ? '&' : '?';
    return `${rendered}${sep}width=1200&quality=80`;
  }
  return url;
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchProduct(slug) {
  const rows = await supabaseGet(
    `products?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true` +
      `&select=id,name,slug,description,brand_name,category_name,model,unit_price,primary_image_url&limit=1`,
  );
  const product = Array.isArray(rows) ? rows[0] : null;
  if (!product) return null;

  // Prefer the primary uploaded image; fall back to the product_images gallery.
  if (!product.primary_image_url) {
    const images = await supabaseGet(
      `product_images?product_id=eq.${product.id}&select=url,is_primary,display_order&order=display_order`,
    );
    if (Array.isArray(images) && images.length) {
      product.primary_image_url = (images.find((i) => i.is_primary) || images[0]).url;
    }
  }
  return product;
}

/**
 * Replace the content of a meta tag matched by `attr="value"`, or append a fresh
 * tag before </head> when the tag isn't present in the base HTML.
 */
function setMeta(html, attr, key, content) {
  const safe = escapeHtml(content);
  const re = new RegExp(`(<meta\\s+${attr}=["']${key}["'][^>]*content=["'])[^"']*(["'][^>]*>)`, 'i');
  if (re.test(html)) {
    return html.replace(re, `$1${safe}$2`);
  }
  const tag = `<meta ${attr}="${key}" content="${safe}" />`;
  return html.replace('</head>', `    ${tag}\n</head>`);
}

function injectTags(html, product) {
  const image = absoluteImage(product.primary_image_url);
  const url = `${SITE_URL}/product/${product.slug}`;
  const titleText = `${product.name}${product.model ? ` – ${product.model}` : ''} | USJ Technologies`;
  const description =
    (product.description ||
      `Buy ${product.name}${product.model ? ` (${product.model})` : ''} from USJ Technologies – GeM registered ${product.brand_name || ''} electronics supplier in Dehradun. B2B pricing, pan-India delivery.`
    ).slice(0, 300);

  let out = html;

  // <title>
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(titleText)}</title>`);

  // The base index.html declares og:image:width=1200 / height=630 for the org
  // banner. Product photos have different dimensions, and a wrong declared size
  // makes WhatsApp/Facebook reject the image (blank preview). Drop them so the
  // scraper auto-detects the real dimensions.
  out = out.replace(/\s*<meta\s+property=["']og:image:(width|height)["'][^>]*>/gi, '');

  // Standard + Open Graph + Twitter tags
  out = setMeta(out, 'name', 'description', description);
  out = setMeta(out, 'property', 'og:type', 'product');
  out = setMeta(out, 'property', 'og:url', url);
  out = setMeta(out, 'property', 'og:title', titleText);
  out = setMeta(out, 'property', 'og:description', description);
  out = setMeta(out, 'property', 'og:image', image);
  out = setMeta(out, 'property', 'og:image:secure_url', image);
  out = setMeta(out, 'property', 'og:image:type', 'image/jpeg');
  out = setMeta(out, 'property', 'og:image:alt', product.name);
  out = setMeta(out, 'name', 'twitter:card', 'summary_large_image');
  out = setMeta(out, 'name', 'twitter:title', titleText);
  out = setMeta(out, 'name', 'twitter:description', description);
  out = setMeta(out, 'name', 'twitter:image', image);

  // Canonical
  out = out.replace(
    /(<link\s+rel=["']canonical["']\s+href=["'])[^"']*(["'][^>]*>)/i,
    `$1${escapeHtml(url)}$2`,
  );

  return out;
}

export default async function handler(req, res) {
  const slug = (req.query?.slug || '').toString();

  // Base HTML: fetch the real static index.html (a filesystem asset, so it is not
  // re-routed back into this function — no loop).
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let baseHtml = '';
  try {
    const r = await fetch(`https://${host}/index.html`);
    baseHtml = await r.text();
  } catch {
    baseHtml = '';
  }

  const sendHtml = (html) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  };

  // If we couldn't load the base shell, or config is missing, degrade gracefully.
  if (!baseHtml || !SUPABASE_URL || !SUPABASE_ANON_KEY || !slug) {
    return sendHtml(baseHtml || `<!doctype html><title>USJ Technologies</title>`);
  }

  try {
    const product = await fetchProduct(slug);
    if (!product) return sendHtml(baseHtml); // unknown product → default org OG tags
    return sendHtml(injectTags(baseHtml, product));
  } catch {
    return sendHtml(baseHtml);
  }
}
