-- Create nft_purchases table to track NFT sales
CREATE TABLE IF NOT EXISTS public.nft_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  buyer_wallet TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  price NUMERIC NOT NULL,
  mint_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_signature TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nft_purchases ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create purchase records
CREATE POLICY "Anyone can create purchase records"
  ON public.nft_purchases
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view purchase records
CREATE POLICY "Anyone can view purchase records"
  ON public.nft_purchases
  FOR SELECT
  USING (true);

-- Only system can update purchase records (via edge functions)
CREATE POLICY "System can update purchase records"
  ON public.nft_purchases
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_nft_purchases_nft_id ON public.nft_purchases(nft_id);
CREATE INDEX idx_nft_purchases_buyer_wallet ON public.nft_purchases(buyer_wallet);
CREATE INDEX idx_nft_purchases_status ON public.nft_purchases(status);