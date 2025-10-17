-- Add is_creator_conversation column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS is_creator_conversation BOOLEAN NOT NULL DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_creator 
ON conversations(tutor_id, user_id, is_creator_conversation) 
WHERE is_creator_conversation = true;