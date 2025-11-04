-- Drop the admin policy that applies to ALL operations
DROP POLICY IF EXISTS "Admin can manage advisors" ON public.advisors;

-- Recreate admin policies for SELECT, UPDATE, DELETE only (not INSERT)
CREATE POLICY "Admin can select advisors"
ON public.advisors
AS PERMISSIVE
FOR SELECT
USING (
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

CREATE POLICY "Admin can update advisors"
ON public.advisors
AS PERMISSIVE
FOR UPDATE
USING (
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
)
WITH CHECK (
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

CREATE POLICY "Admin can delete advisors"
ON public.advisors
AS PERMISSIVE
FOR DELETE
USING (
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);

CREATE POLICY "Admin can insert advisors"
ON public.advisors
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]))
);