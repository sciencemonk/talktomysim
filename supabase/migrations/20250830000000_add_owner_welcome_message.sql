-- Add owner_welcome_message column to advisors table
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS owner_welcome_message TEXT;

-- Update existing records to have the same welcome message for both public and owner
-- This ensures backward compatibility
UPDATE advisors SET owner_welcome_message = welcome_message WHERE owner_welcome_message IS NULL AND welcome_message IS NOT NULL;
