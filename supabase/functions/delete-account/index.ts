/**
 * Supabase Edge Function: delete-account
 *
 * Self-service account deletion for customers and USJ Partners.
 * Requires a valid user JWT (Authorization header).
 *
 * Deploy:
 *   supabase functions deploy delete-account
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TEAM_ROLES = new Set(['admin', 'manager', 'staff']);

// KYC documents uploaded before the vendor → USJ Partner rename still live
// in the legacy `vendor-kyc` bucket, so both are swept on deletion.
const KYC_BUCKETS = ['partner-kyc', 'vendor-kyc'];

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function bucketAndPathFromUrl(url: string): { bucket: string; path: string } | null {
  for (const bucket of KYC_BUCKETS) {
    const marker = `/${bucket}/`;
    const index = url.indexOf(marker);
    if (index !== -1) {
      return { bucket, path: url.slice(index + marker.length) };
    }
  }
  return null;
}

async function closePartner(
  admin: ReturnType<typeof createClient>,
  partnerId: string,
  userId: string,
) {
  const { data: partner } = await admin
    .from('usj_partners')
    .select('kyc_document_urls')
    .eq('id', partnerId)
    .maybeSingle();

  const pathsByBucket = new Map<string, Set<string>>(
    KYC_BUCKETS.map((bucket) => [bucket, new Set<string>()]),
  );

  for (const url of partner?.kyc_document_urls ?? []) {
    const found = bucketAndPathFromUrl(url);
    if (found) pathsByBucket.get(found.bucket)?.add(found.path);
  }

  // Also sweep the user's own folder, to catch uploads that never made it
  // onto kyc_document_urls.
  for (const bucket of KYC_BUCKETS) {
    const { data: folderFiles } = await admin.storage.from(bucket).list(userId);
    for (const file of folderFiles ?? []) {
      pathsByBucket.get(bucket)?.add(`${userId}/${file.name}`);
    }
  }

  for (const [bucket, paths] of pathsByBucket) {
    if (paths.size > 0) {
      await admin.storage.from(bucket).remove([...paths]);
    }
  }

  await admin.from('products').update({ is_active: false }).eq('partner_id', partnerId);

  await admin
    .from('usj_partners')
    .update({
      status: 'closed',
      business_name: 'Closed Account',
      contact_info: {},
      kyc_document_urls: [],
      gst_number: null,
      pan_number: null,
      storefront_description: null,
      logo_url: null,
      created_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partnerId);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return jsonResponse({ error: 'Server misconfigured' }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role, partner_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile && TEAM_ROLES.has(profile.role)) {
      return jsonResponse(
        { error: 'Team accounts must be removed by an administrator.' },
        403,
      );
    }

    const handledPartnerIds = new Set<string>();

    if (profile?.partner_id) {
      await closePartner(admin, profile.partner_id, user.id);
      handledPartnerIds.add(profile.partner_id);
    }

    const { data: ownedPartners } = await admin
      .from('usj_partners')
      .select('id')
      .eq('created_by', user.id);

    for (const partner of ownedPartners ?? []) {
      if (handledPartnerIds.has(partner.id)) continue;
      await closePartner(admin, partner.id, user.id);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('delete-account error:', err);
    return jsonResponse(
      { error: 'Account deletion failed. Please try again or contact support.' },
      500,
    );
  }
});
