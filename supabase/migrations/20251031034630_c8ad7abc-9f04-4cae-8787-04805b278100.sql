-- Set mrjethroknights as a verified account
UPDATE advisors
SET is_verified = true
WHERE id IN (
  SELECT id FROM advisors
  WHERE social_links->>'x_username' ILIKE 'mrjethroknights'
  AND sim_category = 'Crypto Mail'
);