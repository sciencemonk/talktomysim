
-- First, let's drop the existing conflicting policies and recreate them properly
DROP POLICY IF EXISTS "Allow anonymous conversation creation for public advisors" ON public.conversations;
DROP POLICY IF EXISTS "Allow anonymous users to read conversations for public advisors" ON public.conversations;
DROP POLICY IF EXISTS "Allow anonymous message creation for public advisors" ON public.messages;
DROP POLICY IF EXISTS "Allow anonymous message reading for public advisors" ON public.messages;

-- Now create the correct policies for anonymous users
-- Allow anonymous users to insert conversations for public advisors
CREATE POLICY "Anonymous can create conversations for public advisors" ON public.conversations
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  tutor_id IN (
    SELECT id FROM public.advisors 
    WHERE is_public = true AND is_active = true
  )
);

-- Allow anonymous users to select conversations for public advisors
CREATE POLICY "Anonymous can read conversations for public advisors" ON public.conversations
FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM public.advisors 
    WHERE is_public = true AND is_active = true
  )
);

-- Allow anonymous users to insert messages in conversations for public advisors
CREATE POLICY "Anonymous can create messages for public advisors" ON public.messages
FOR INSERT 
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  )
);

-- Allow anonymous users to select messages in conversations for public advisors  
CREATE POLICY "Anonymous can read messages for public advisors" ON public.messages
FOR SELECT 
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  )
);
