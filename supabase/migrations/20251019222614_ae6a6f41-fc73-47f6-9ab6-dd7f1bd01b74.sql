-- Add price column to advisors table for $SimAI pricing
ALTER TABLE advisors 
ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN advisors.price IS 'Price in $SimAI tokens. 0 or NULL means free.';