-- Add integrations field to advisors table
ALTER TABLE advisors
ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb;