-- ============================================================
-- USJ Technologies — Migration: Create Vendors Table
-- Foundational migration for multi-vendor marketplace support
-- 
-- Creates:
-- - vendors table with KYC/business info
-- - vendors storage bucket policy
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name         TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  gst_number            TEXT,
  pan_number            TEXT,
  kyc_document_urls     TEXT[] DEFAULT '{}',  -- Array of storage URLs
  status                TEXT NOT NULL DEFAULT 'pending'
                        CONSTRAINT vendors_status_check
                        CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  contact_info          JSONB DEFAULT '{}'::jsonb,  -- { contact_person, phone, email, bank_details }
  storefront_description TEXT,
  logo_url              TEXT,
  created_by            UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for vendors table
-- Public: anyone can read approved vendor info (for storefront display)
CREATE POLICY "public_read_approved_vendors" ON vendors
  FOR SELECT USING (status = 'approved');

-- Applicants: users can read their own vendor application
CREATE POLICY "users_read_own_vendor" ON vendors
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR id IN (SELECT vendor_id FROM profiles WHERE id = auth.uid()));

-- Applicants: users can submit a vendor application
CREATE POLICY "users_insert_vendors" ON vendors
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Team: managers and admins have full access to all vendors (for KYC review)
CREATE POLICY "team_all_vendors" ON vendors
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- Verification
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY column_name;
