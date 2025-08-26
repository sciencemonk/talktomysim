-- Drop the public_advisors view if it exists
DROP VIEW IF EXISTS public.public_advisors;

-- Update RLS policies to allow anonymous access to advisors table
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to read active advisors
CREATE POLICY "Allow anonymous users to read active advisors" 
ON public.advisors 
FOR SELECT 
TO anon
USING (is_active = true);

-- Create policy to allow authenticated users to read active advisors
CREATE POLICY "Allow authenticated users to read active advisors" 
ON public.advisors 
FOR SELECT 
TO authenticated
USING (is_active = true);
