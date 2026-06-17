# USJ Technologies — Work Log

All completed development work across sessions. Most recent changes at top.

---

## Session 6 — 2026-06-17

### Features Added / Fixed

#### 13. Careers Platform — Full Build
**Files:**
- `supabase/migrations/20240617000013_careers.sql` — job_postings + job_applications tables, RLS, resumes storage bucket
- `supabase/migrations/20240617000014_fix_applications_access.sql` — explicit GRANTs + split FOR ALL into per-operation policies (SELECT/UPDATE/DELETE)
- `frontend/src/pages/CareersPage.jsx` — public careers page (load from DB, job drawer, apply form)
- `frontend/src/pages/admin/CareersAdminPage.jsx` — admin careers page
- `frontend/src/components/layout/AdminLayout.jsx` — Careers in sidebar
- `frontend/src/components/layout/Navbar.jsx` — Careers in main nav
- `frontend/src/config/app.js` — ADMIN_CAREERS route
- `frontend/src/App.jsx` — /admin/careers route

**Admin page features:**
- Job list with applications nested inline per job (not a separate flat tab)
- Applications toggle button per job — shows count, opens inline table
- Shortened job ID visible on card (last 8 chars) + copy full UUID button
- Toggle active/featured/edit/delete per job
- Delete job: fetches all resume URLs → removes files from resumes bucket → deletes job row (CASCADE handles applications rows)
- Confirm dialog shows exact application count before delete
- Per-application status dropdown, Details panel (contact, resume link, cover note, internal notes, status pipeline)

**Public page features:**
- Loads only `is_active = true` jobs, ordered by featured then created_at
- Department filter pills + type dropdown
- Slide-over drawer: Job Details tab + Apply Now tab
- Application success screen after submit
- Speculative application mailto link

**Apply form validation (strict):**
- Name: required, min 2 chars
- Email: required, valid email regex
- Phone: optional; if provided, must be exactly 10 digits (digits only, formatting stripped before save)
- LinkedIn: optional; if provided must start with https://
- Resume: optional; PDF only (accept=".pdf"), max 5 MB
- All errors shown inline below fields, validated on blur + on change (after first touch), submit blocked until clean

**RLS design:**
- `public_read_active_jobs` — anyone reads active jobs (no auth)
- `team_manage_jobs` — admin/manager full CRUD on job_postings
- `public_submit_application` — anyone can INSERT (anon public apply)
- `team_select_applications` — admin/manager SELECT (explicit, not FOR ALL)
- `team_update_applications` — admin/manager UPDATE
- `team_delete_applications` — admin/manager DELETE
- Storage: anyone upload/read resumes; only team can delete

#### 14. Bug Fix — Admin Cannot Read Applications
**Root cause (2 issues combined):**
1. Missing `GRANT SELECT ON job_applications TO authenticated` — Supabase auto-grants only apply at project init for tables that exist then; new tables in later migrations need explicit grants
2. `FOR ALL` policy combined with a separate `FOR INSERT` policy creates ambiguity in PostgreSQL RLS resolution; the USING clause of FOR ALL was not being evaluated for SELECT in all scenarios

**Fix:** Migration 014 adds explicit `GRANT SELECT, INSERT, UPDATE, DELETE ON job_applications TO authenticated` and `GRANT INSERT ON job_applications TO anon`, then drops `team_manage_applications` (FOR ALL) and replaces with three explicit policies (team_select_applications, team_update_applications, team_delete_applications).

#### 15. SEO Implementation
**Files:** `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/components/seo/SEOHead.jsx`, `frontend/.env`, multiple page files, `frontend/public/robots.txt`, `frontend/public/sitemap.xml`
- `react-helmet-async` for per-page dynamic meta
- JSON-LD: Organization, LocalBusiness, WebSite (with SearchAction), Product, Service, ContactPage, AboutPage, BreadcrumbList
- Geo meta tags targeting Dehradun / Uttarakhand
- robots.txt blocks /admin/, /profile, /orders, /cart, /checkout, /wishlist, /login, /register
- sitemap.xml covers all static pages + brand-filtered shop URLs

#### 16. Storage Delete Cleanup
**Files:** `frontend/src/pages/admin/ProductsAdminPage.jsx`, `frontend/src/pages/admin/CertificationsAdminPage.jsx`
- On product delete: fetches image URLs from product_images, extracts path after `/product-images/`, removes from bucket (non-blocking)
- On certification delete: same pattern for the single image_url
- Uses URL marker pattern: `url.indexOf('/product-images/')` → `url.slice(i + MARKER.length)`

---

## Testing Checklist (run before each deploy)

### Careers Platform
- [ ] Submit an application via public `/careers` page — verify it appears in admin
- [ ] Phone: try 9 digits → error; 10 digits → pass; letters → error
- [ ] Resume: upload .doc → rejected; upload .jpg → rejected; upload PDF >5MB → rejected; valid PDF → accepted
- [ ] Status update in admin → refresh → confirm persists
- [ ] Admin notes save → refresh → confirm persists
- [ ] Delete job with applications → resume file removed from Storage bucket
- [ ] Toggle active → job disappears from public careers page
- [ ] Toggle featured → job moves to top on public page

### Core Site
- [ ] Quote flow: cart → submit → email received at admin address
- [ ] Product search: "router", "switch", "TENDA" return correct results
- [ ] Product delete: image gone from Storage bucket
- [ ] Certification delete: image gone from Storage bucket
- [ ] Mobile: navbar, shop, product detail, careers on 375px viewport
- [ ] RBAC: staff role cannot see Products/Certifications/Careers in admin sidebar
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] 404: navigate to unknown URL — handles gracefully

---

## Session 4 — 2026-06-15

### Features Added

#### 9. Role-Based Access Control (RBAC)
**Files:**
- `supabase/migrations/20240615000012_rbac.sql` — DB schema changes
- `frontend/src/pages/admin/AccessControlAdminPage.jsx` — New admin page
- `frontend/src/components/layout/AdminLayout.jsx` — Role-filtered sidebar nav
- `frontend/src/components/layout/AdminRoute.jsx` — Allow manager/staff in admin
- `frontend/src/store/authStore.js` — Added `hasRole()` helper
- `frontend/src/config/app.js` — Added `ADMIN_ACCESS_CONTROL` route
- `frontend/src/App.jsx` — Added `/admin/access-control` route

**What was built:**
- New `invited_roles` DB table: admin pre-assigns a role (admin/manager/staff) to an email
- Updated `handle_new_user` Postgres trigger: on registration, checks `invited_roles` and auto-applies the role to `profiles`
- New helper SQL functions: `is_manager_or_above()`, `is_staff_or_above()`
- Extended `profiles.role` CHECK constraint from `('customer','admin')` to `('customer','admin','manager','staff')`
- New RLS policies: staff/manager can read & update all quote_requests; managers can manage products/images/brands/categories/certifications; admins can update all profiles
- **Access Control page** (`/admin/access-control`): shows pre-assigned roles list + registered team members with current roles; allows adding/editing/removing role assignments; immediately updates existing profiles
- Sidebar nav is now role-filtered: admin sees all pages; manager sees Dashboard/Inquiries/Products/Certifications; staff sees Dashboard/Inquiries only
- Staff and managers can log in to `/admin` with appropriate scoped access

**Roles defined:**
| Role | Access |
|------|--------|
| `admin` | Full access to all admin pages |
| `manager` | Dashboard, Inquiries, Products, Certifications |
| `staff` | Dashboard, Inquiries only |
| `customer` | Public site only |

**Action required:** Run migration 012 in Supabase SQL Editor.

#### 10. Phone Number in Quote/Inquiry Admin View
**File:** `frontend/src/pages/admin/InquiriesAdminPage.jsx`
- Added `Phone` icon import from lucide-react
- Phone number now displays in the quote card header alongside email and organization
- Uses separator dot (`·`) for clean inline display
- Data was already being captured (`quote_requests.phone` column exists) — just wasn't being shown

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

## Migration Status

| Migration | Status |
|-----------|--------|
| 001–009 | ✅ Applied |
| 010 product_pricing | ✅ Applied |
| 011 storage_policies | ✅ Applied |
| 012 rbac | ✅ Applied |
| 013 careers | ✅ Applied (supabase db push) |
| 014 fix_applications_access | ✅ Applied (supabase db push) |

## Pending Actions

- Ensure `profiles.role = 'admin'` is set for all admin team emails (use Access Control admin page or Supabase Studio)
- Verify `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL` are set as Supabase Edge Function secrets
- Set `VITE_SITE_URL=https://usjtechnologies.com` in Vercel environment variables
