-- Delete Emily sim
DELETE FROM advisors WHERE id = 'e1187472-4b17-446d-b148-8bef2f7d4f3d';

-- Move Inappropriate Jokes to entertainment category
UPDATE advisors 
SET category = 'entertainment' 
WHERE id = '349a3f44-12a5-402d-9749-40f81e60f726';