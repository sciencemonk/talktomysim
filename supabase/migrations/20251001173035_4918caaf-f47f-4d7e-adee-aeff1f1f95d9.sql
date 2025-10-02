-- Add custom_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'advisors' AND column_name = 'custom_url') THEN
    ALTER TABLE advisors ADD COLUMN custom_url text UNIQUE;
    CREATE INDEX idx_advisors_custom_url ON advisors(custom_url);
  END IF;
END $$;

-- Add unique constraint for one living sim per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_living_sim_per_user 
ON advisors(user_id) 
WHERE sim_type = 'living';