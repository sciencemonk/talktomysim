
-- Update RLS policies to ensure anonymous conversations and messages are properly stored and retrieved

-- First, let's make sure the conversations table policies are correct
DROP POLICY IF EXISTS "Allow anonymous conversation access" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous conversation creation" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous conversation updates" ON conversations;

-- Allow anyone to read conversations (needed for sim owners to see all conversations)
CREATE POLICY "Public read access to conversations" 
  ON conversations 
  FOR SELECT 
  USING (true);

-- Allow anyone to create conversations (for anonymous users)
CREATE POLICY "Public create access to conversations" 
  ON conversations 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update conversations (for updating timestamps)
CREATE POLICY "Public update access to conversations" 
  ON conversations 
  FOR UPDATE 
  USING (true);

-- Now fix the messages table policies
DROP POLICY IF EXISTS "Allow anonymous message access" ON messages;
DROP POLICY IF EXISTS "Allow anonymous message creation" ON messages;

-- Allow anyone to read messages (needed for conversation viewing)
CREATE POLICY "Public read access to messages" 
  ON messages 
  FOR SELECT 
  USING (true);

-- Allow anyone to create messages (for anonymous users)
CREATE POLICY "Public create access to messages" 
  ON messages 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update messages (if needed for metadata updates)
CREATE POLICY "Public update access to messages" 
  ON messages 
  FOR UPDATE 
  USING (true);
