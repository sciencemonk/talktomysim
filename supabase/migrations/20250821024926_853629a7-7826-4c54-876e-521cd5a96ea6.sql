
-- First, let's drop existing policies to start fresh
DROP POLICY IF EXISTS "All users can view advisors" ON public.advisors;
DROP POLICY IF EXISTS "Only admin can manage advisors" ON public.advisors;

-- Create a policy that allows anyone to read advisors (public access)
CREATE POLICY "Public read access to advisors" 
ON public.advisors 
FOR SELECT 
USING (true);

-- Create a policy that allows only admin to insert/update/delete advisors
CREATE POLICY "Admin can manage advisors" 
ON public.advisors 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text
);

-- Also allow anonymous insert for seeding (temporary, can be removed after seeding)
CREATE POLICY "Allow seeding advisors"
ON public.advisors
FOR INSERT
WITH CHECK (true);
