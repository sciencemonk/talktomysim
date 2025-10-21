-- Update missing custom_url values by generating slugs from names
UPDATE advisors 
SET custom_url = 
  CASE 
    WHEN custom_url IS NULL OR custom_url = '' THEN
      lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
    ELSE custom_url
  END
WHERE is_active = true AND (custom_url IS NULL OR custom_url = '');