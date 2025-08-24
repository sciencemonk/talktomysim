
-- Add is_active column to advisors table
ALTER TABLE advisors ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN advisors.is_active IS 'Controls whether the sim is publicly visible and accessible';
