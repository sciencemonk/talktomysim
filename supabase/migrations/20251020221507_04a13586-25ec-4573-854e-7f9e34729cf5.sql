-- Update custom_url for all advisors that don't have one set
-- Generate URL-friendly slugs from their names
UPDATE advisors
SET custom_url = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '[^\w\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE custom_url IS NULL OR custom_url = '';

-- Add index on custom_url for better query performance
CREATE INDEX IF NOT EXISTS idx_advisors_custom_url ON advisors(custom_url);