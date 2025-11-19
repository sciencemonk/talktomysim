-- Add rating and reviews to products table
ALTER TABLE products
ADD COLUMN rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN review_count integer DEFAULT 0,
ADD COLUMN reviews jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.rating IS 'Average product rating from 0 to 5';
COMMENT ON COLUMN products.review_count IS 'Total number of reviews';
COMMENT ON COLUMN products.reviews IS 'Array of review objects with reviewer_name, rating, comment, date';