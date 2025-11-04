-- Drop the problematic policy that applies to ALL operations
DROP POLICY IF EXISTS "Users can manage their own advisors" ON public.advisors;

-- Recreate it to ONLY apply to SELECT, UPDATE, DELETE (not INSERT)
CREATE POLICY "Users can manage their own advisors"
ON public.advisors
AS PERMISSIVE
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

CREATE POLICY "Users can update their own advisors"
ON public.advisors
AS PERMISSIVE
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

CREATE POLICY "Users can delete their own advisors"
ON public.advisors
AS PERMISSIVE
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);