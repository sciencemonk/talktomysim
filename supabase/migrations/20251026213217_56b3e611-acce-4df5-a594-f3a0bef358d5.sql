-- Set all sims to NOT verified by default
UPDATE public.advisors 
SET is_verified = false 
WHERE is_verified = true;

-- Only set Jethro as verified
UPDATE public.advisors 
SET is_verified = true 
WHERE name ILIKE '%Jethro%' AND sim_category = 'Crypto Mail';

-- Change the default for future inserts
ALTER TABLE public.advisors 
ALTER COLUMN is_verified SET DEFAULT false;