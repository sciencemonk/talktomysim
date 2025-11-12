-- Create user profiles table for Coinbase authenticated users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_sign_in timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile by wallet address
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert profiles (for sign-up)
CREATE POLICY "Anyone can create profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address 
  ON public.user_profiles(wallet_address);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);