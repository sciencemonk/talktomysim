-- Migration to properly support anonymous conversations in the database
-- This allows public visitors to create and use conversations without authentication

-- First, make sure the conversations table allows null user_id
-- This should already be in place from migration 20250823163726, but we'll ensure it
ALTER TABLE IF EXISTS conversations ALTER COLUMN user_id DROP NOT NULL;

-- Add is_anonymous flag to conversations table for better querying
ALTER TABLE IF EXISTS conversations ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Create or replace the RLS policies for anonymous conversations

-- Allow anonymous access to create conversations
DROP POLICY IF EXISTS "Allow anonymous conversation creation" ON conversations;
CREATE POLICY "Allow anonymous conversation creation" 
  ON conversations 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anonymous access to read their conversations (based on conversation_id in localStorage)
DROP POLICY IF EXISTS "Allow anonymous conversation reading" ON conversations;
CREATE POLICY "Allow anonymous conversation reading" 
  ON conversations 
  FOR SELECT 
  USING (true);

-- Allow anonymous access to update their conversations
DROP POLICY IF EXISTS "Allow anonymous conversation updates" ON conversations;
CREATE POLICY "Allow anonymous conversation updates" 
  ON conversations 
  FOR UPDATE 
  USING (true);

-- Now handle the messages table for anonymous conversations

-- Allow anonymous users to create messages
DROP POLICY IF EXISTS "Allow anonymous message creation" ON messages;
CREATE POLICY "Allow anonymous message creation" 
  ON messages 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anonymous users to read messages
DROP POLICY IF EXISTS "Allow anonymous message reading" ON messages;
CREATE POLICY "Allow anonymous message reading" 
  ON messages 
  FOR SELECT 
  USING (true);

-- Add function to update conversation timestamps when messages are added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_timestamp ON messages;
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
