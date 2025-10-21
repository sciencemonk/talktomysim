-- Manually update all active sims that have null or empty custom_url
UPDATE advisors
SET custom_url = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
WHERE is_active = true 
  AND (custom_url IS NULL OR custom_url = '');

-- Verify the update worked
SELECT id, name, custom_url FROM advisors WHERE name ILIKE '%ray%dalio%';