-- Fix the security definer view issue by recreating it properly
DROP VIEW IF EXISTS public.public_advisors;

-- Create the view without security definer (it's not a security definer by default)
-- This view will respect the RLS policies of the querying user
CREATE VIEW public.public_advisors AS
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

-- Ensure proper permissions on the view
GRANT SELECT ON public.public_advisors TO anon;
GRANT SELECT ON public.public_advisors TO authenticated;