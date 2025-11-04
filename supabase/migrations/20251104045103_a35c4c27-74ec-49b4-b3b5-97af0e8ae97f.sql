-- Drop the restrictive X agent creation policy
DROP POLICY IF EXISTS "Allow X agent creation with pending status" ON public.advisors;

-- Create a permissive policy for X agent creation
CREATE POLICY "Allow X agent creation"
ON public.advisors
FOR INSERT
WITH CHECK (
  sim_category = 'Crypto Mail'
);