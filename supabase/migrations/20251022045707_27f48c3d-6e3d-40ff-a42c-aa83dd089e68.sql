-- Add edit_code column to advisors table
ALTER TABLE advisors ADD COLUMN edit_code TEXT;

-- Create index for faster lookups by edit code
CREATE INDEX idx_advisors_edit_code ON advisors(edit_code);

-- Add comment explaining the column
COMMENT ON COLUMN advisors.edit_code IS 'Six-digit code that allows the creator to edit this sim';
