-- Fix critical security vulnerabilities by removing public access and implementing proper RLS policies

-- 1. Fix conversations table - restrict to conversation participants only
DROP POLICY IF EXISTS "Public read access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public create access to conversations" ON public.conversations; 
DROP POLICY IF EXISTS "Public update access to conversations" ON public.conversations;

-- Allow users to see conversations where they are participants or own the tutor/advisor
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = user_id OR 
  tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()) OR
  advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid())
);

-- Allow creating conversations when user owns the tutor/advisor
CREATE POLICY "Users can create conversations for their tutors/advisors"
ON public.conversations
FOR INSERT
WITH CHECK (
  tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()) OR
  advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid()) OR
  auth.uid() = user_id
);

-- Allow updating conversations when user is participant or owns tutor/advisor
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()) OR
  advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid())
);

-- 2. Fix messages table - restrict to conversation participants only
DROP POLICY IF EXISTS "Public read access to messages" ON public.messages;
DROP POLICY IF EXISTS "Public create access to messages" ON public.messages;
DROP POLICY IF EXISTS "Public update access to messages" ON public.messages;

-- Allow users to see messages in their conversations only
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c 
    WHERE c.user_id = auth.uid() 
    OR c.tutor_id IN (SELECT t.id FROM public.tutors t WHERE t.user_id = auth.uid())
    OR c.advisor_id IN (SELECT a.id FROM public.advisors a WHERE a.user_id = auth.uid())
  )
);

-- Allow creating messages in conversations user participates in
CREATE POLICY "Users can create messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM public.conversations c 
    WHERE c.user_id = auth.uid() 
    OR c.tutor_id IN (SELECT t.id FROM public.tutors t WHERE t.user_id = auth.uid())
    OR c.advisor_id IN (SELECT a.id FROM public.advisors a WHERE a.user_id = auth.uid())
  )
);

-- Allow updating messages in conversations user participates in
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c 
    WHERE c.user_id = auth.uid() 
    OR c.tutor_id IN (SELECT t.id FROM public.tutors t WHERE t.user_id = auth.uid())
    OR c.advisor_id IN (SELECT a.id FROM public.advisors a WHERE a.user_id = auth.uid())
  )
);

-- 3. Fix tutors table - remove public read access, keep only user-owned access
DROP POLICY IF EXISTS "Allow public read access to tutors" ON public.tutors;

-- The existing policies for tutors are already secure (user_id = auth.uid()), 
-- but we need to ensure public access is completely removed

-- 4. Ensure conversation_captures access is properly restricted (policies already exist and look correct)

-- 5. Add missing DELETE policies for conversations and messages (currently blocked)
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (
  auth.uid() = user_id OR 
  tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()) OR
  advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c 
    WHERE c.user_id = auth.uid() 
    OR c.tutor_id IN (SELECT t.id FROM public.tutors t WHERE t.user_id = auth.uid())
    OR c.advisor_id IN (SELECT a.id FROM public.advisors a WHERE a.user_id = auth.uid())
  )
);