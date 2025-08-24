
-- Allow anonymous users to create messages in conversations for public advisors
CREATE POLICY "Allow anonymous message creation for public advisors" ON public.messages
FOR INSERT 
TO anon
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  )
);

-- Allow anonymous users to read messages in conversations for public advisors
CREATE POLICY "Allow anonymous message reading for public advisors" ON public.messages
FOR SELECT 
TO anon
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  )
);
