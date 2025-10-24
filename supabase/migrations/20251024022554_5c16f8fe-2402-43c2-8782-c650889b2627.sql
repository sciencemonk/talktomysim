-- Add x402 payment fields to advisors table
ALTER TABLE advisors
ADD COLUMN IF NOT EXISTS x402_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS x402_wallet text,
ADD COLUMN IF NOT EXISTS x402_enabled boolean DEFAULT false;

COMMENT ON COLUMN advisors.x402_price IS 'Price in USDC (e.g., 0.01 for $0.01) required to chat with this sim';
COMMENT ON COLUMN advisors.x402_wallet IS 'EVM-compatible wallet address to receive x402 payments';
COMMENT ON COLUMN advisors.x402_enabled IS 'Whether x402 payment is required for this sim';