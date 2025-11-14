-- First, delete duplicate stores, keeping only the most recent one per user
DELETE FROM stores
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM stores
  ORDER BY user_id, created_at DESC
);

-- Now add unique constraint to ensure one store per user
ALTER TABLE stores ADD CONSTRAINT stores_user_id_key UNIQUE (user_id);