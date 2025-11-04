-- Add is_verified boolean field to advisors table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Add index for filtering verified agents
CREATE INDEX IF NOT EXISTS idx_advisors_is_verified ON public.advisors(is_verified);