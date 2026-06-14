/**
 * Supabase Edge Function: send-quote-email
 *
 * Triggered by the frontend after a quote_request is inserted.
 * Sends two emails via Resend:
 *   1. Admin notification with full cart + customer details
 *   2. Customer confirmation with their reference number
 *
 * Deploy:
 *   supabase functions deploy send-quote-email
 *
 * Set secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxxxx
 *   supabase secrets set ADMIN_EMAIL=admin@usjtechnologies.com
 *   supabase secrets set FROM_EMAIL=noreply@usjtechnologies.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface QuoteItem {
  product_name: string;
  product_sku: string | null;
  brand_name: string | null;
  quantity: number;
  image_url: string | null;
}

interface QuotePayload {
  reference_number: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message?: string;
  items: QuoteItem[];
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `USJ Technologies <${Deno.env.get('FROM_EMAIL') ?? 'noreply@usjtechnologies.com'}>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${err}`);
  }
  return res.json();
}

function buildAdminEmail(q: QuotePayload): string {
  const rows = q.items.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.brand_name ?? '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_sku ?? '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
    </tr>`).join('');

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#0A1628;padding:24px;border-radius:8px 8px 0 0;">
    <h1 style="color:#C9A84C;margin:0;font-size:20px;">New Quote Request</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">Ref: ${q.reference_number}</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;">
    <h2 style="color:#0A1628;font-size:16px;margin-top:0;">Customer Details</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:130px;">Name</td><td style="padding:4px 0;font-weight:600;">${q.name}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;">${q.email}</td></tr>
      ${q.phone ? `<tr><td style="padding:4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${q.phone}</td></tr>` : ''}
      ${q.organization ? `<tr><td style="padding:4px 0;color:#666;">Organization</td><td style="padding:4px 0;">${q.organization}</td></tr>` : ''}
    </table>

    ${q.message ? `<div style="margin-top:16px;padding:12px;background:#fff;border-left:3px solid #C9A84C;font-size:14px;color:#333;">${q.message}</div>` : ''}

    <h2 style="color:#0A1628;font-size:16px;margin-top:24px;">Requested Products</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#0A1628;color:#fff;">
          <th style="padding:10px 8px;text-align:left;">Product</th>
          <th style="padding:10px 8px;text-align:left;">Brand</th>
          <th style="padding:10px 8px;text-align:left;">SKU / Model</th>
          <th style="padding:10px 8px;text-align:center;">Qty</th>
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

function buildCustomerEmail(q: QuotePayload): string {
  const rows = q.items.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
    </tr>`).join('');

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#0A1628;padding:24px;border-radius:8px 8px 0 0;">
    <h1 style="color:#C9A84C;margin:0;font-size:20px;">Quote Request Received</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">USJ Technologies Pvt Ltd</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;">
    <p style="font-size:15px;color:#333;">Dear <strong>${q.name}</strong>,</p>
    <p style="font-size:14px;color:#555;">Thank you for your interest. We have received your quote request and our team will get back to you within 24 business hours with pricing and availability.</p>

    <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px;margin:16px 0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#666;">Your Reference Number</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#0A1628;letter-spacing:2px;">${q.reference_number}</p>
    </div>

    <h3 style="color:#0A1628;font-size:14px;">Products Requested:</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Product</th>
          <th style="padding:8px;text-align:center;">Qty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <p style="font-size:13px;color:#555;margin-top:20px;">If you have any urgent queries, please contact us at <a href="mailto:info@usjtechnologies.com" style="color:#C9A84C;">info@usjtechnologies.com</a> or call us directly.</p>
  </div>
  <div style="background:#eee;padding:16px;border-radius:0 0 8px 8px;font-size:12px;color:#666;text-align:center;">
    USJ Technologies Pvt Ltd — Dehradun, Uttarakhand, India
  </div>
</div>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const payload: QuotePayload = await req.json();

    if (!payload.email || !payload.name || !payload.reference_number) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'admin@usjtechnologies.com';

    await Promise.all([
      sendEmail(adminEmail, `New Quote Request — ${payload.reference_number}`, buildAdminEmail(payload)),
      sendEmail(payload.email, `Quote Request Confirmed — ${payload.reference_number}`, buildCustomerEmail(payload)),
    ]);

    return new Response(JSON.stringify({ success: true, reference: payload.reference_number }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('send-quote-email error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
