-- Mark all historical sims created by admins as official
-- This updates sims where sim_type is 'historical' or NULL (defaults to historical)
-- and where user_id is NULL or belongs to admin users

UPDATE advisors 
SET is_official = true
WHERE (sim_type = 'historical' OR sim_type IS NULL)
  AND (
    user_id IS NULL 
    OR user_id IN (
      SELECT id FROM auth.users 
      WHERE email IN ('artolaya@gmail.com', 'michael@dexterlearning.com')
    )
  );