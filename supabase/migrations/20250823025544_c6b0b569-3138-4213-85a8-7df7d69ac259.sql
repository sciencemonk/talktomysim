
-- Add the missing writing_sample column to the advisors table
ALTER TABLE public.advisors 
ADD COLUMN writing_sample text;
