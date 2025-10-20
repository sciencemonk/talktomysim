-- Add auto_description field to advisors table for auto-generated short descriptions
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS auto_description text;