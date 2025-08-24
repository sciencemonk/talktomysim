
-- Drop and recreate the conversations INSERT policy to properly handle anonymous users
DROP POLICY IF EXISTS "Allow all users to create conversations" ON conversations;

CREATE POLICY "Allow all users to create conversations" 
ON conversations 
FOR INSERT 
WITH CHECK (
  -- For authenticated users: they can create conversations with their own tutors/advisors or as participants
  (
    auth.uid() IS NOT NULL 
    AND (
      (tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid())) 
      OR (advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())) 
      OR (auth.uid() = user_id)
    )
  ) 
  OR 
  -- For anonymous users: they can create conversations with public advisors (using tutor_id field)
  (
    auth.uid() IS NULL 
    AND user_id IS NULL 
    AND tutor_id IN (
      SELECT id FROM advisors 
      WHERE is_public = true AND is_active = true
    )
  )
);

-- Also update the messages INSERT policy to handle anonymous conversations
DROP POLICY IF EXISTS "Allow all users to create messages" ON messages;

CREATE POLICY "Allow all users to create messages" 
ON messages 
FOR INSERT 
WITH CHECK (
  -- For authenticated users
  (
    auth.uid() IS NOT NULL 
    AND conversation_id IN (
      SELECT c.id FROM conversations c
      WHERE (
        c.user_id = auth.uid() 
        OR c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) 
        OR c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
      )
    )
  ) 
  OR 
  -- For anonymous users with public advisors
  (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN advisors a ON c.tutor_id = a.id
      WHERE a.is_public = true AND a.is_active = true
    )
  )
);

-- Update SELECT policy for messages to handle anonymous conversations
DROP POLICY IF EXISTS "Allow all users to read messages" ON messages;

CREATE POLICY "Allow all users to read messages" 
ON messages 
FOR SELECT 
USING (
  -- For authenticated users
  (
    auth.uid() IS NOT NULL 
    AND conversation_id IN (
      SELECT c.id FROM conversations c
      WHERE (
        c.user_id = auth.uid() 
        OR c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) 
        OR c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
      )
    )
  ) 
  OR 
  -- For anonymous users with public advisors
  (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN advisors a ON c.tutor_id = a.id
      WHERE a.is_public = true AND a.is_active = true
    )
  )
);
