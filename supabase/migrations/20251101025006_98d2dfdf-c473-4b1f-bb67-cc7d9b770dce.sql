-- Update cryptodivix agent to be verified
UPDATE advisors 
SET is_verified = true
WHERE (social_links->>'x_username')::text ILIKE '%cryptodivix%' 
AND sim_category = 'Crypto Mail';