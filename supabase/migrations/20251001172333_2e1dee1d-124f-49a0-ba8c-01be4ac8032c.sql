-- Add sim_type column to advisors table to distinguish historical vs user-created sims
ALTER TABLE advisors ADD COLUMN sim_type text DEFAULT 'historical' CHECK (sim_type IN ('historical', 'living'));

-- Update existing advisors to be historical
UPDATE advisors SET sim_type = 'historical' WHERE sim_type IS NULL;

-- Add index for filtering
CREATE INDEX idx_advisors_sim_type ON advisors(sim_type);