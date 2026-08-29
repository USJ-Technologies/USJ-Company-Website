-- ============================================================
-- USJ Technologies — Migration: Account deletion support
--
-- Allows customers and vendors to delete their auth account.
-- - vendors.created_by no longer blocks auth.users deletion
-- - vendors.status gains 'closed' for deactivated storefronts
-- ============================================================

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_created_by_fkey;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_status_check;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_status_check
  CHECK (status IN ('pending', 'approved', 'suspended', 'rejected', 'closed'));
