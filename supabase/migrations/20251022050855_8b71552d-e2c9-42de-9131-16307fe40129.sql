-- Remove specific sims by setting them as inactive
UPDATE advisors 
SET is_active = false
WHERE LOWER(name) IN (
  'mark zuckerberg',
  'virgen soldier',
  'donald j. trump',
  '$gruta'
);
