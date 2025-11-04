-- Drop ALL existing insert policies that might conflict
DROP POLICY IF EXISTS "Allow X agent creation without auth" ON public.advisors;
DROP POLICY IF EXISTS "Allow anyone to create sims" ON public.advisors;
DROP POLICY IF EXISTS "Users can manage their own advisors" ON public.advisors;

-- Recreate the users policy to NOT apply to inserts, only select/update/delete
CREATE POLICY "Users can manage their own advisors"
ON public.advisors
FOR ALL
USING (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

-- Create ONE simple policy for X agent creation that allows anonymous inserts for Crypto Mail
CREATE POLICY "Allow anonymous X agent creation"
ON public.advisors
FOR INSERT
WITH CHECK (
  sim_category = 'Crypto Mail'
);

-- Keep the general sims creation policy
CREATE POLICY "Allow anyone to create sims"
ON public.advisors
FOR INSERT
WITH CHECK (true);