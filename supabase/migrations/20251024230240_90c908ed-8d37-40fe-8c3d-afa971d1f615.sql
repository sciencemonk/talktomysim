-- Add RLS policy to allow anonymous users to update advisors with valid edit code
CREATE POLICY "Allow updates with valid edit code"
ON public.advisors
FOR UPDATE
USING (edit_code IS NOT NULL)
WITH CHECK (edit_code IS NOT NULL);