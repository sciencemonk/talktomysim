-- Add category column to advisors table for marketplace categorization
ALTER TABLE advisors 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'uncategorized';

COMMENT ON COLUMN advisors.category IS 'Category for marketplace filtering (historical, kol, crypto, tokens, business, coaching, entertainment, education, lifestyle, erotic, etc.)';

-- Create an index for better category filtering performance
CREATE INDEX IF NOT EXISTS idx_advisors_category ON advisors(category) WHERE is_active = true;