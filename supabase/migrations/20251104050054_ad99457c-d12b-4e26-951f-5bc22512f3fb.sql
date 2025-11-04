-- Drop the current X agent creation policy
DROP POLICY IF EXISTS "Allow X agent creation" ON public.advisors;

-- Create a comprehensive policy for X agent creation that explicitly allows NULL user_id
CREATE POLICY "Allow X agent creation without auth"
ON public.advisors
FOR INSERT
WITH CHECK (
  sim_category = 'Crypto Mail' AND (user_id IS NULL OR auth.uid() = user_id OR auth.uid() IS NULL)
);