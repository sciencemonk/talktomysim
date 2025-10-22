-- Drop the existing "Allow seeding advisors" policy if it exists
DROP POLICY IF EXISTS "Allow seeding advisors" ON public.advisors;

-- Create a new policy that explicitly allows anonymous sim creation
CREATE POLICY "Allow anyone to create sims"
ON public.advisors
FOR INSERT
WITH CHECK (true);

-- Ensure anonymous users can read public and active advisors
-- This policy should already exist, but let's make sure it's correct
DROP POLICY IF EXISTS "Allow anonymous users to read public advisors" ON public.advisors;

CREATE POLICY "Allow anonymous users to read public advisors"
ON public.advisors
FOR SELECT
USING ((is_public = true) AND (is_active = true));