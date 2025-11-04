-- Drop the restrictive policy that blocks creation
DROP POLICY IF EXISTS "Only approved creators can create X agents" ON public.advisors;

-- Create a new policy that allows creation but marks them as pending
CREATE POLICY "Allow X agent creation with pending status"
ON public.advisors
FOR INSERT
WITH CHECK (
  CASE
    WHEN (sim_category = 'Crypto Mail') THEN 
      -- Allow creation but must be inactive and pending verification
      (is_active = false AND verification_status = 'pending')
    ELSE 
      true
  END
);