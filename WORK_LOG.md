# USJ Technologies — Work Log

All completed development work across sessions. Most recent changes at top.

---

## Session 3 — 2026-06-15

### Bug Fixes

#### 1. Products save "column images does not exist" — FIXED
**File:** `frontend/src/pages/admin/ProductsAdminPage.jsx`  
**Root cause:** `handleSave` was sending `images: [...]` in the payload to the `products` table, but `images` is not a column there. Product images live in the separate `product_images` table.  
**Fix:** Removed `images` from the `products` payload. After a successful INSERT/UPDATE, the code now:
- Generates product ID client-side (`crypto.randomUUID()`) for new products so no SELECT is needed
- Deletes existing rows in `product_images` for that product ID
- Re-inserts the primary image + additional images into `product_images`

#### 2. Storage upload permissions — MIGRATION ADDED
**File:** `supabase/migrations/20240615000011_storage_policies.sql`  
**Reason:** No storage bucket policies were set up in migrations. Uploads to `product-images` bucket (product images and certification images) could fail without proper RLS on `storage.objects`.  
**Fix:** Created migration 011 with policies:
- Public read on all files in `product-images` bucket
- Authenticated users (admins) can INSERT, UPDATE, DELETE  
**Action required:** Run this migration in Supabase SQL Editor.

#### 3. ROUTES.PRODUCT_DETAIL mismatch — FIXED
**File:** `frontend/src/config/app.js`  
**Root cause:** `ROUTES.PRODUCT_DETAIL` pointed to `/shop/product/:slug` but all components (ProductCard, CartPage, WishlistPage, Admin) use `/product/:slug`.  
**Fix:** Changed to `/product/${slug}` to match the canonical route used everywhere.

---

### Features Added

#### 4. Product Pricing
**Files:** `supabase/migrations/20240614000010_product_pricing.sql`, `frontend/src/lib/queries.js`, `frontend/src/pages/admin/ProductsAdminPage.jsx`, `frontend/src/components/shop/ProductCard.jsx`, `frontend/src/pages/ProductDetailPage.jsx`  
- Added `unit_price NUMERIC(12,2) DEFAULT NULL` column to `products` table
- Admin can set price per product (₹ field in product form)
- Product cards show formatted Indian rupee price or "Price on Request" if null
- "Bulk pricing available" shown on every card
- Detail page shows price prominently with "Special pricing for bulk & govt orders"  
**Action required:** Run migration 010 in Supabase SQL Editor.

#### 5. Dynamic Brand Dropdown (Admin)
**File:** `frontend/src/pages/admin/ProductsAdminPage.jsx`  
- Removed hardcoded `['ENTER', 'TENDA', 'ZOOOK']` brand list
- New `BrandCombobox` component: loads brands from the `brands` DB table
- "Add new brand" button in dropdown — types name, inserts into `brands` table, immediately selects it
- Admin product list filter buttons also load brands dynamically from DB

#### 6. Shop Page Ordering Fix
**File:** `frontend/src/lib/queries.js`  
- Changed `ORDER BY created_at DESC` to `ORDER BY id ASC` for the public shop
- Root cause: ZOOOK products were seeded last, so all of page 1 was ZOOOK
- UUID IDs are random → stable mixed-brand ordering across pages

#### 7. Product Card Design
**File:** `frontend/src/components/shop/ProductCard.jsx`  
- Image area changed from flat white to cool blue-gray gradient (`#EBF2FA → #DCE9F7`)
- `drop-shadow` CSS filter applied to product image — white and black products now both visible
- Shadow-based card (no flat border) with subtle lift on hover
- Brand pills colored per brand (ENTER=blue, TENDA=green, ZOOOK=gold)

#### 8. Homepage Redesign
**Files:** `frontend/src/components/home/HeroSection.jsx`, `WhatWeDo.jsx`, `WhyChooseUs.jsx`, `ContactCTABanner.jsx`
- **HeroSection:** Refined credential pill, heavier font weight heading, client tag scroll strip, gradient bottom fade replacing SVG wave
- **WhatWeDo:** Completely redesigned — removed 3-identical-icon-card template. Now a split layout: sticky left intro with stats + numbered service rows with dividers on right
- **WhyChooseUs:** Replaced generic paragraph with 9 specific trust signal tiles on dark background (GeM, Startup India, MSME, Genuine Products, Delivery, GST Invoice, Bulk Pricing, Support, GeM Tender)
- **ContactCTABanner:** Changed from centered text block to two-column layout with gold primary CTA button

---

## Session 2 — 2026-06-14

### Bug Fixes

#### Quote Submission 401 Error — FIXED
**File:** `frontend/src/lib/queries.js`  
**Root cause:** `.select('id, reference_number')` chained after `.insert()` triggered a SELECT blocked by RLS (anon users can insert but not select their own quote — `user_id` is NULL so `auth.uid() = user_id` evaluates to NULL).  
**Fix:** Generate `quoteId` (crypto.randomUUID()) and `referenceNumber` client-side before INSERT. Pass both in the INSERT payload. No SELECT needed.

#### CORS Error on Edge Function — FIXED
**File:** `frontend/src/lib/queries.js`  
**Root cause:** Frontend was sending `apikey` header in the Edge Function fetch. The Edge Function's CORS preflight only allows `Content-Type, Authorization`.  
**Fix:** Removed `apikey` header from the fetch call.

#### `key_features` Showing 0 After Migration — FIXED
**File:** `supabase/migrations/20240614000009_tenda_key_features_fix.sql`  
**Root cause:** Migration 008 had `AND (description IS NULL OR description = '')` guard. A prior partial run had already set descriptions, so key_features were never touched.  
**Fix:** Migration 009 sets key_features unconditionally for all 16 Tenda categories.

### Features Added

#### CertificationsAdminPage — BUILT
**File:** `frontend/src/pages/admin/CertificationsAdminPage.jsx`  
Full CRUD for certifications: table listing, visibility toggle, slide-in drawer with image upload to Supabase Storage (`product-images/certifications/`), delete with confirm.

#### OrgCombobox (Quote Form) — BUILT
**File:** `frontend/src/pages/QuoteRequestPage.jsx`  
Custom combobox for the Organization field: 14 default orgs (govt/defence), localStorage persistence, "Add to list" button for new orgs, search bar when 10+ orgs exist.

---

## Session 1 — Prior Work

### Features Added

#### Tenda Product Descriptions — MIGRATION 008
**File:** `supabase/migrations/20240614000008_tenda_descriptions.sql`  
Category-specific descriptions and key_features for all 16 Tenda product categories. Real model numbers used (BE7200, BE5100, TEM2008D, TC3T24C, TN3108-8P, G500-F, etc.).

#### Initial Schema, RLS, Auth Setup
- Migration 001: Full schema (brands, categories, products, product_images, profiles, cart_items, quote_requests, quote_items, ventures, certifications, projects)
- Migration 002: RLS policies — public read, user own-data, admin full access via `is_admin()` function
- Migration 003: Auth trigger fix
- Migration 004: team_members table
- Migration 005: user_product_views for smart recommendations
- Migration 006: Static content seed

---

## Pending Actions (must be done in Supabase SQL Editor)

| Migration | Action |
|-----------|--------|
| Migration 009 | Run `20240614000009_tenda_key_features_fix.sql` |
| Migration 010 | Run `20240614000010_product_pricing.sql` |
| Migration 011 | Run `20240615000011_storage_policies.sql` |
| admin_setup.sql | Ensure admin role is set for all team emails |
