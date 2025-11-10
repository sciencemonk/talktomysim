-- Delete mrjethroknights account from all tables
DELETE FROM advisors 
WHERE social_links->>'x_username' ILIKE 'mrjethroknights' 
   OR social_links->>'userName' ILIKE 'mrjethroknights';

DELETE FROM sims 
WHERE x_username ILIKE 'mrjethroknights';

-- Also remove from approved_x_creators
DELETE FROM approved_x_creators 
WHERE username ILIKE 'mrjethroknights';