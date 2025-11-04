-- Drop ALL insert policies
DROP POLICY IF EXISTS "Allow anyone to create sims" ON public.advisors;
DROP POLICY IF EXISTS "Allow anonymous X agent creation" ON public.advisors;
DROP POLICY IF EXISTS "Allow X agent creation without auth" ON public.advisors;

-- Create ONE simple permissive policy for all inserts
CREATE POLICY "Allow all inserts"
ON public.advisors
AS PERMISSIVE
FOR INSERT
WITH CHECK (true);