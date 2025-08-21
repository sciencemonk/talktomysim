
-- Add is_verified column to advisors table
ALTER TABLE public.advisors 
ADD COLUMN is_verified boolean NOT NULL DEFAULT true;

-- Set all existing advisors to verified by default
UPDATE public.advisors 
SET is_verified = true;
