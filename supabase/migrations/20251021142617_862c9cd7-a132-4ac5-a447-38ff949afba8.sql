-- Add auto_description column to user_advisors table
ALTER TABLE user_advisors 
ADD COLUMN IF NOT EXISTS auto_description TEXT;