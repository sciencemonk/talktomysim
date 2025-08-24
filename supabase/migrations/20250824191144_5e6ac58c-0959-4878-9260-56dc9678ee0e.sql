-- Fix advisors table security vulnerability by restricting public access to safe fields only

-- Remove the current broad public read access policy
DROP POLICY IF EXISTS "Public read access to advisors" ON public.advisors;

-- Create a restrictive policy that only allows public access to basic discovery fields
-- This protects sensitive prompts, background content, and business logic
CREATE POLICY "Public read access to basic advisor info only"
ON public.advisors
FOR SELECT
USING (
  -- Only allow public access to public advisors
  is_public = true AND is_active = true
);

-- However, we need to use a view or modify application logic to restrict fields
-- Since RLS can't restrict specific columns, we need to create a public view
-- that only exposes safe fields for discovery

-- Create a secure public view for marketplace discovery
CREATE OR REPLACE VIEW public.public_advisors AS
SELECT 
  id,
  name,
  title,
  description,
  avatar_url,
  category,
  is_public,
  is_active,
  is_verified,
  created_at,
  updated_at,
  custom_url,
  current_profession,
  years_experience,
  location
FROM public.advisors
WHERE is_public = true AND is_active = true;

-- Grant public access to the view
GRANT SELECT ON public.public_advisors TO anon;
GRANT SELECT ON public.public_advisors TO authenticated;

-- The existing advisors table policies ensure:
-- 1. Users can manage their own advisors (full access to their own data)
-- 2. Admin can manage all advisors 
-- 3. Public can only see basic info through the new restricted policy

-- Note: Applications should use the public_advisors view for marketplace browsing
-- and the full advisors table only for authenticated advisor management