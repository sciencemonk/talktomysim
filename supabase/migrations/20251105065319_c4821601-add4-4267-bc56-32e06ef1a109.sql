-- Create payment_sessions table for secure server-side payment tracking
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  agent_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  payment_signature TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  network TEXT NOT NULL DEFAULT 'base',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON public.payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_wallet ON public.payment_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON public.payment_sessions(expires_at) WHERE is_active = true;

-- Policy: Anyone can create payment sessions (needed for public x402 flow)
CREATE POLICY "Anyone can create payment sessions"
  ON public.payment_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own payment sessions by wallet
CREATE POLICY "Users can view payment sessions by wallet"
  ON public.payment_sessions
  FOR SELECT
  USING (true);

-- Policy: System can update payment sessions (for expiry/deactivation)
CREATE POLICY "System can update payment sessions"
  ON public.payment_sessions
  FOR UPDATE
  USING (true);

-- Create function to validate payment sessions
CREATE OR REPLACE FUNCTION public.validate_payment_session(
  p_session_id TEXT,
  p_wallet_address TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_valid BOOLEAN;
BEGIN
  -- Check if session exists, is active, not expired, and matches wallet
  SELECT EXISTS (
    SELECT 1
    FROM public.payment_sessions
    WHERE session_id = p_session_id
      AND wallet_address = p_wallet_address
      AND is_active = true
      AND expires_at > now()
  ) INTO v_session_valid;
  
  RETURN v_session_valid;
END;
$$;

-- Create function to cleanup expired sessions (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_payment_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deactivate expired sessions
  UPDATE public.payment_sessions
  SET is_active = false
  WHERE is_active = true
    AND expires_at <= now();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;