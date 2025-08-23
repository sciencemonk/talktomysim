
-- Update conversations table policies to allow anonymous access
DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous conversation creation" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous conversation access" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous conversation updates" ON conversations
  FOR UPDATE USING (true);

-- Update messages table policies to allow anonymous access
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Create new policies that allow anonymous message access
CREATE POLICY "Allow anonymous message creation" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous message access" ON messages
  FOR SELECT USING (true);
