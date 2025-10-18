-- Remove avatar for Bartek Glac sim to use fallback avatar
UPDATE advisors 
SET avatar_url = NULL 
WHERE id = 'fd7af722-046c-4541-a79e-d6eb86531c94';