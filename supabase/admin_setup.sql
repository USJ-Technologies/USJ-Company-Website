-- ============================================================
-- USJ Technologies — Admin User Setup
-- Run this in Supabase Dashboard → SQL Editor AFTER you have
-- registered on the frontend with jitesh@usjtechnologies.com
-- ============================================================

-- Grant admin role (update both possible emails in case either was used to register)
UPDATE profiles
SET role = 'admin'
WHERE email IN ('jitesh@usjtechnologies.com', 'usinfotechddn@gmail.com','bhanu@usjtechnologies.com');

-- Verify
SELECT id, name, email, role, created_at
FROM profiles
WHERE email IN ('jitesh@usjtechnologies.com', 'usinfotechddn@gmail.com','bhanu@usjtechnologies.com');
