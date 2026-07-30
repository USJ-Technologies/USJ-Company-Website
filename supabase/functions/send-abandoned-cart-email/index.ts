/**
 * Supabase Edge Function: send-abandoned-cart-email
 *
 * Queries for abandoned carts (24h+ with no quote request) and sends
 * a daily summary email to the tech team via Resend.
 *
 * Deploy:
 *   supabase functions deploy send-abandoned-cart-email
 *
 * Secrets needed (same as send-quote-email):
 *   RESEND_API_KEY, FROM_EMAIL
 *
 * Trigger: pg_cron schedule or external cron hitting this endpoint daily.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const NOTIFY_EMAIL = 'techteam@usjtechnologies.com';

function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface AbandonedCartItem {
  id: string;
  product_name: string;
  brand_name: string | null;
  image_url: string | null;
  quantity: number;
}

interface AbandonedCart {
  id: string;
  name: string;
  phone: string;
  user_id: string | null;
  created_at: string;
  user_type: 'guest' | 'registered';
  items: AbandonedCartItem[];
}

async function fetchAbandonedCarts(): Promise<AbandonedCart[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return [];

  // Query cart_leads that have no matching quote_requests by phone
  const leadsRes = await fetch(
    `${supabaseUrl}/rest/v1/cart_leads?select=id,name,phone,user_id,created_at,guest_cart_items(id,product_name,brand_name,image_url,quantity)&created_at=lte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}&order=created_at.desc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!leadsRes.ok) {
    console.error('Failed to fetch cart_leads:', await leadsRes.text());
    return [];
  }

  const leads = await leadsRes.json();

  // Fetch all quote_requests phones for matching
  const quotesRes = await fetch(
    `${supabaseUrl}/rest/v1/quote_requests?select=phone,user_id,created_at&order=created_at.desc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  const quotes = quotesRes.ok ? await quotesRes.json() : [];

  // Filter leads where no quote_requests exists with matching phone after lead creation
  const abandoned: AbandonedCart[] = [];
  for (const lead of leads) {
    const hasQuote = quotes.some(
      (q: { phone: string; created_at: string }) =>
        q.phone === lead.phone &&
        new Date(q.created_at).getTime() >= new Date(lead.created_at).getTime()
    );
    if (!hasQuote) {
      abandoned.push({
        ...lead,
        user_type: lead.user_id ? 'registered' : 'guest',
        items: lead.guest_cart_items ?? [],
      });
    }
  }

  return abandoned;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildSummaryEmail(carts: AbandonedCart[]): string {
  if (carts.length === 0) {
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#0A1628;padding:24px;border-radius:8px 8px 0 0;">
    <h1 style="color:#C9A84C;margin:0;font-size:20px;">Abandoned Carts — Daily Summary</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">USJ Technologies</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;">
    <p style="font-size:14px;color:#555;">No abandoned carts in the last 24 hours. Great news!</p>
  </div>
  <div style="background:#eee;padding:16px;border-radius:0 0 8px 8px;font-size:12px;color:#666;text-align:center;">
    USJ Technologies Pvt Ltd — Dehradun, Uttarakhand
  </div>
</div>`;
  }

  const rows = carts
    .map((cart) => {
      const products = cart.items.length > 0
        ? cart.items.map((i) => `${escapeHtml(i.product_name)} (×${i.quantity})`).join(', ')
        : '<em style="color:#999;">No product details</em>';

      return `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-weight:600;">${escapeHtml(cart.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;">
        <a href="tel:+91${escapeHtml(cart.phone)}" style="color:#0A1628;text-decoration:none;">+91 ${escapeHtml(cart.phone)}</a>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:13px;">${products}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">
        <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;${
          cart.user_type === 'registered'
            ? 'background:#EBF5FF;color:#1A56DB;'
            : 'background:#FFF7ED;color:#D97706;'
        }">${cart.user_type === 'registered' ? 'Registered' : 'Guest'}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;color:#718096;font-size:13px;">${timeAgo(cart.created_at)}</td>
    </tr>`;
    })
    .join('');

  return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
  <div style="background:#0A1628;padding:24px;border-radius:8px 8px 0 0;">
    <h1 style="color:#C9A84C;margin:0;font-size:20px;">Abandoned Carts — Daily Summary</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">${carts.length} lead${carts.length !== 1 ? 's' : ''} with abandoned carts</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;">
    <p style="font-size:14px;color:#555;margin-bottom:16px;">
      The following leads added items to cart but did not submit a quote request within 24 hours.
      Consider reaching out to convert these into orders.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#0A1628;color:#fff;">
          <th style="padding:10px 8px;text-align:left;">Name</th>
          <th style="padding:10px 8px;text-align:left;">Phone</th>
          <th style="padding:10px 8px;text-align:left;">Products</th>
          <th style="padding:10px 8px;text-align:center;">Type</th>
          <th style="padding:10px 8px;text-align:left;">Since</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#eee;padding:16px;border-radius:0 0 8px 8px;font-size:12px;color:#666;text-align:center;">
    USJ Technologies Pvt Ltd — Dehradun, Uttarakhand
  </div>
</div>`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const carts = await fetchAbandonedCarts();

    // Skip sending if there are no abandoned carts
    if (carts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No abandoned carts to report', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const html = buildSummaryEmail(carts);

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `USJ Technologies <${Deno.env.get('FROM_EMAIL') ?? 'noreply@usjtechnologies.com'}>`,
        to: [NOTIFY_EMAIL],
        subject: `Abandoned Carts — ${carts.length} lead${carts.length !== 1 ? 's' : ''} need follow-up`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${err}`);
    }

    return new Response(
      JSON.stringify({ success: true, count: carts.length }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    console.error('send-abandoned-cart-email error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
});
