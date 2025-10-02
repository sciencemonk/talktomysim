-- Add wallet_address column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- Create index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
ON public.profiles(wallet_address);