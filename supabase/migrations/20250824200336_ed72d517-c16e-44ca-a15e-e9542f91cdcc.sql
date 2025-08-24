
-- Allow anonymous users to create conversations for public advisors
CREATE POLICY "Allow anonymous conversation creation for public advisors" ON public.conversations
FOR INSERT 
TO anon
WITH CHECK (
  user_id IS NULL AND 
  tutor_id IN (
    SELECT id FROM public.advisors 
    WHERE is_public = true AND is_active = true
  )
);

-- Allow anonymous users to read their own conversations (based on tutor_id)
CREATE POLICY "Allow anonymous users to read conversations for public advisors" ON public.conversations
FOR SELECT 
TO anon
USING (
  tutor_id IN (
    SELECT id FROM public.advisors 
    WHERE is_public = true AND is_active = true
  )
);
