-- Remove @ from mrjethroknights display name
UPDATE advisors
SET name = 'MrJethroKnights'
WHERE id IN (
  SELECT id FROM advisors
  WHERE social_links->>'x_username' ILIKE 'mrjethroknights'
  AND sim_category = 'Crypto Mail'
  AND name LIKE '@%'
);