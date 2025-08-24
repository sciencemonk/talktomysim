
-- Revert conversations table RLS policies to original state
DROP POLICY IF EXISTS "Allow all users to read conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to update their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all users to create conversations" ON conversations;

-- Restore original conversations policies
CREATE POLICY "Allow all users to read conversations" 
ON conversations FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  )) OR
  tutor_id IN (SELECT id FROM advisors WHERE is_public = true AND is_active = true)
);

CREATE POLICY "Allow users to update their conversations" 
ON conversations FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Allow users to delete their conversations" 
ON conversations FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Allow all users to create conversations" 
ON conversations FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND (
    tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid()) OR
    advisor_id IN (SELECT id FROM advisors WHERE user_id = auth.uid()) OR
    auth.uid() = user_id
  )) OR
  (auth.uid() IS NULL AND user_id IS NULL AND tutor_id IN (SELECT id FROM advisors WHERE is_public = true AND is_active = true))
);

-- Revert messages table RLS policies to original state  
DROP POLICY IF EXISTS "Allow all users to read messages" ON messages;
DROP POLICY IF EXISTS "Allow users to update their messages" ON messages;
DROP POLICY IF EXISTS "Allow users to delete their messages" ON messages;
DROP POLICY IF EXISTS "Allow all users to create messages" ON messages;

-- Restore original messages policies
CREATE POLICY "Allow all users to read messages" 
ON messages FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE 
    c.user_id = auth.uid() OR 
    c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
    c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
  )) OR
  conversation_id IN (
    SELECT c.id FROM conversations c 
    JOIN advisors a ON c.tutor_id = a.id 
    WHERE a.is_public = true AND a.is_active = true
  )
);

CREATE POLICY "Allow users to update their messages" 
ON messages FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE 
    c.user_id = auth.uid() OR 
    c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
    c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
  )
);

CREATE POLICY "Allow users to delete their messages" 
ON messages FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE 
    c.user_id = auth.uid() OR 
    c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
    c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
  )
);

CREATE POLICY "Allow all users to create messages" 
ON messages FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND conversation_id IN (
    SELECT c.id FROM conversations c WHERE 
    c.user_id = auth.uid() OR 
    c.tutor_id IN (SELECT t.id FROM tutors t WHERE t.user_id = auth.uid()) OR
    c.advisor_id IN (SELECT a.id FROM advisors a WHERE a.user_id = auth.uid())
  )) OR
  conversation_id IN (
    SELECT c.id FROM conversations c 
    JOIN advisors a ON c.tutor_id = a.id 
    WHERE a.is_public = true AND a.is_active = true
  )
);
