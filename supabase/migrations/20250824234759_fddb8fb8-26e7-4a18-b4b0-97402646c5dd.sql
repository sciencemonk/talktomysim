
-- Drop the public_advisors table as it's not needed
DROP TABLE IF EXISTS public.public_advisors;

-- Update RLS policies for advisors table to allow public read access to active advisors
DROP POLICY IF EXISTS "Allow anonymous users to read public advisors" ON public.advisors;

CREATE POLICY "Allow anonymous users to read active advisors" 
ON public.advisors 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);
