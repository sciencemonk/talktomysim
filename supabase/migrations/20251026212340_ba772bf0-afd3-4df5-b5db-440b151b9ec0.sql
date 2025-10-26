-- Update Jethro to be verified
UPDATE public.advisors 
SET is_verified = true 
WHERE name ILIKE '%Jethro%' AND sim_category = 'Crypto Mail';