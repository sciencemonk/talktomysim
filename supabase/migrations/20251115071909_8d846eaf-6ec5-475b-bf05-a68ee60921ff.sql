-- Update existing user_profiles to have proper email addresses
UPDATE public.user_profiles
SET email = LOWER(SUBSTRING(wallet_address FROM 1 FOR 8)) || '@wallet.sim'
WHERE email IS NULL;