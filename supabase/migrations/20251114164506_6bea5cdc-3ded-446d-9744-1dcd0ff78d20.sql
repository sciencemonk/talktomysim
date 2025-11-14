-- Clear all existing crypto_wallet values from stores table
-- Store owners must manually add their Solana wallet address
UPDATE stores 
SET crypto_wallet = NULL 
WHERE crypto_wallet IS NOT NULL;

-- Add a comment to the column to clarify its purpose
COMMENT ON COLUMN stores.crypto_wallet IS 'Solana wallet address for receiving USDC payments. Must be manually configured by store owner.';