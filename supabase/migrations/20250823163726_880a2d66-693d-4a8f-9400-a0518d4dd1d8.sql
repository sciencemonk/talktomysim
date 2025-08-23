
-- Remove foreign key constraint and make user_id nullable to support anonymous conversations
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;

-- Add a new constraint that allows either a valid user_id OR null for anonymous users
-- We'll keep the foreign key for authenticated users but allow nulls
ALTER TABLE conversations ADD CONSTRAINT conversations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;
