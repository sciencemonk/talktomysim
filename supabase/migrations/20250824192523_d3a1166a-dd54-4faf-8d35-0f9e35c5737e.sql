-- CRITICAL: Remove public access to sensitive personal information in advisors table
-- The advisors table contains personal data that should not be publicly accessible

-- Remove the overly permissive public read policy that exposes all fields
DROP POLICY IF EXISTS "Public read access to basic advisor info only" ON public.advisors;

-- The advisors table should only be accessible to:
-- 1. Users who own the advisor (already covered by "Users can manage their own advisors" policy)
-- 2. Admin users (already covered by "Admin can manage advisors" policy)  
-- 3. Seeding operations (already covered by "Allow seeding advisors" policy)

-- Public users should ONLY use the secure public_advisors view which exposes safe fields
-- This ensures sensitive data like full_name, date_of_birth, education, background_content,
-- prompts, and other personal information is protected

-- Verify the public_advisors view exists and is properly configured
-- This view only exposes: id, name, title, description, avatar_url, category, 
-- is_public, is_active, is_verified, created_at, updated_at, custom_url,
-- current_profession, years_experience, location (basic professional info only)

-- Add a comment to document the security approach
COMMENT ON TABLE public.advisors IS 'SECURITY: Contains sensitive personal and business data. Public access via public_advisors view only. Direct table access restricted to owners and admins.';

COMMENT ON VIEW public.public_advisors IS 'SECURITY: Safe public view exposing only basic professional information for advisor discovery. Protects personal details, business logic, and proprietary prompts.';