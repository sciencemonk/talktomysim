
-- Create RLS policy to allow public access to welcome_message for public advisors
CREATE POLICY "Allow public access to welcome_message for public advisors" ON public.advisors
FOR SELECT 
TO anon
USING (is_public = true AND is_active = true)
WITH CHECK (false);

-- Ensure RLS is enabled on advisors table
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
