
-- Add url column to the advisors table
ALTER TABLE public.advisors 
ADD COLUMN url text UNIQUE;

-- Add a comment to describe the column
COMMENT ON COLUMN public.advisors.url IS 'Custom URL path for public chat access (e.g., "thomas-jefferson" for /thomas-jefferson)';

-- Create an index on the url column for faster lookups
CREATE INDEX idx_advisors_url ON public.advisors(url) WHERE url IS NOT NULL;
