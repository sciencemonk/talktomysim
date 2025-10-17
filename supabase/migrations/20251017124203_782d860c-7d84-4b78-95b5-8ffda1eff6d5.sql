-- Add is_official field to advisors table to mark official historical sims
ALTER TABLE advisors 
ADD COLUMN is_official boolean DEFAULT false;

-- Update existing historical sims created by admins to be marked as official
-- You can manually set these to true for specific sims through the Supabase dashboard