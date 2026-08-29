/**
 * Supabase Edge Function: delete-account
 *
 * Self-service account deletion for customers and vendors.
 * Requires a valid user JWT (Authorization header).
 *
 * Deploy:
 *   supabase functions deploy delete-account
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TEAM_ROLES = new Set(['admin', 'manager', 'staff']);
const KYC_MARKER = '/vendor-kyc/';

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

function storagePathFromUrl(url: string, marker: string): string | null {
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

async function closeVendor(
  admin: ReturnType<typeof createClient>,
  vendorId: string,
  userId: string,
) {
  const { data: vendor } = await admin
    .from('vendors')
    .select('kyc_document_urls')
    .eq('id', vendorId)
    .maybeSingle();

  const paths = new Set<string>();

  for (const url of vendor?.kyc_document_urls ?? []) {
    const path = storagePathFromUrl(url, KYC_MARKER);
    if (path) paths.add(path);
  }

  const { data: folderFiles } = await admin.storage.from('vendor-kyc').list(userId);
  for (const file of folderFiles ?? []) {
    paths.add(`${userId}/${file.name}`);
  }

  if (paths.size > 0) {
    await admin.storage.from('vendor-kyc').remove([...paths]);
  }

  await admin.from('products').update({ is_active: false }).eq('vendor_id', vendorId);

  await admin
    .from('vendors')
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
    .eq('id', vendorId);
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
      .select('role, vendor_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile && TEAM_ROLES.has(profile.role)) {
      return jsonResponse(
        { error: 'Team accounts must be removed by an administrator.' },
        403,
      );
    }

    const handledVendorIds = new Set<string>();

    if (profile?.vendor_id) {
      await closeVendor(admin, profile.vendor_id, user.id);
      handledVendorIds.add(profile.vendor_id);
    }

    const { data: ownedVendors } = await admin
      .from('vendors')
      .select('id')
      .eq('created_by', user.id);

    for (const vendor of ownedVendors ?? []) {
      if (handledVendorIds.has(vendor.id)) continue;
      await closeVendor(admin, vendor.id, user.id);
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
