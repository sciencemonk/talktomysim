
-- Let's see all current policies on conversations and messages tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages') 
ORDER BY tablename, policyname;

-- Drop ALL existing policies on conversations table to start fresh
DROP POLICY IF EXISTS "Anonymous can create conversations for public advisors" ON public.conversations;
DROP POLICY IF EXISTS "Anonymous can read conversations for public advisors" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations for their tutors/advisors" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Drop ALL existing policies on messages table to start fresh  
DROP POLICY IF EXISTS "Anonymous can create messages for public advisors" ON public.messages;
DROP POLICY IF EXISTS "Anonymous can read messages for public advisors" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

-- Create comprehensive policies that handle both authenticated and anonymous users
-- CONVERSATIONS TABLE
CREATE POLICY "Allow all users to create conversations" ON public.conversations
FOR INSERT 
WITH CHECK (
  -- Authenticated users for their own tutors/advisors
  (auth.uid() IS NOT NULL AND (
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid()) OR
    auth.uid() = user_id
  ))
  OR
  -- Anonymous users for public advisors only
  (auth.uid() IS NULL AND user_id IS NULL AND tutor_id IN (
    SELECT id FROM advisors WHERE is_public = true AND is_active = true
  ))
);

CREATE POLICY "Allow all users to read conversations" ON public.conversations
FOR SELECT 
USING (
  -- Authenticated users for their own conversations
  (auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  ))
  OR
  -- Anonymous users for public advisor conversations
  (tutor_id IN (SELECT id FROM advisors WHERE is_public = true AND is_active = true))
);

CREATE POLICY "Allow users to update their conversations" ON public.conversations
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Allow users to delete their conversations" ON public.conversations
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
);

-- MESSAGES TABLE
CREATE POLICY "Allow all users to create messages" ON public.messages
FOR INSERT 
WITH CHECK (
  -- Authenticated users in their own conversations
  (auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE (
      c.user_id = auth.uid() OR
      c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
      c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
    )
  ))
  OR
  -- Anonymous users in public advisor conversations
  (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  ))
);

CREATE POLICY "Allow all users to read messages" ON public.messages
FOR SELECT 
USING (
  -- Authenticated users in their own conversations
  (auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE (
      c.user_id = auth.uid() OR
      c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
      c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
    )
  ))
  OR
  -- Anonymous users in public advisor conversations
  (conversation_id IN (
    SELECT c.id FROM conversations c
    JOIN advisors a ON c.tutor_id = a.id
    WHERE a.is_public = true AND a.is_active = true
  ))
);

CREATE POLICY "Allow users to update their messages" ON public.messages
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE (
      c.user_id = auth.uid() OR
      c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
      c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Allow users to delete their messages" ON public.messages
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE (
      c.user_id = auth.uid() OR
      c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
      c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
    )
  )
);
