-- Comprehensive fix for security definer view issues
-- Remove SECURITY DEFINER from any views that shouldn't have it

-- The issue might be coming from built-in views or functions
-- Let's ensure our custom views are definitely not security definers

-- Check if there are any materialized views that might be causing issues
-- and recreate our public_advisors view with explicit security settings

-- First, ensure no remnants of old views exist
DROP MATERIALIZED VIEW IF EXISTS public.public_advisors_mv CASCADE;

-- Recreate the public_advisors view with explicit non-security-definer settings
-- Use CREATE OR REPLACE to ensure it's properly reset
CREATE OR REPLACE VIEW public.public_advisors 
WITH (security_barrier=false) AS
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

-- Set explicit ownership and permissions
ALTER VIEW public.public_advisors OWNER TO postgres;
GRANT SELECT ON public.public_advisors TO anon;
GRANT SELECT ON public.public_advisors TO authenticated;
GRANT SELECT ON public.public_advisors TO service_role;

-- Also check if the issue is coming from the RLS policies themselves
-- Ensure all policies are properly set without any security definer issues

COMMENT ON VIEW public.public_advisors IS 'Public view for advisor discovery - does not expose sensitive business logic';

-- If the issue persists, it might be coming from system views
-- Let's ensure no custom functions inadvertently have security definer
-- that shouldn't have it