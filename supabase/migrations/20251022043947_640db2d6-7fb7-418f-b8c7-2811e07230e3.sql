-- Add social_links column to advisors table
ALTER TABLE advisors 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT NULL;

-- Add a comment to document the structure
COMMENT ON COLUMN advisors.social_links IS 'Social media links stored as JSON object with keys: x, website, telegram';