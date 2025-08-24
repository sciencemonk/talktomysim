
-- Add missing columns to advisor_embeddings table
ALTER TABLE public.advisor_embeddings 
ADD COLUMN IF NOT EXISTS start_char integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_char integer DEFAULT 0;

-- Update the existing records to have default values
UPDATE public.advisor_embeddings 
SET start_char = 0, end_char = 0 
WHERE start_char IS NULL OR end_char IS NULL;
