-- Create user_credits table to track monthly credits
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits integer NOT NULL DEFAULT 1000,
  used_credits integer NOT NULL DEFAULT 0,
  reset_date timestamp with time zone NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credits (for initial setup)
CREATE POLICY "Users can insert their own credits"
  ON public.user_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credits
CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create credit_usage_log table to track each credit transaction
CREATE TABLE IF NOT EXISTS public.credit_usage_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  credits_used integer NOT NULL DEFAULT 1,
  usage_type text NOT NULL DEFAULT 'chat', -- 'chat', 'owner_chat', 'public_chat'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_usage_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage log
CREATE POLICY "Users can view their own usage log"
  ON public.credit_usage_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage logs
CREATE POLICY "Service role can insert usage logs"
  ON public.credit_usage_log
  FOR INSERT
  WITH CHECK (true);

-- Create function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-initialize credits for new users
CREATE TRIGGER on_auth_user_created_init_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Create function to reset credits monthly
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_credits
  SET 
    used_credits = 0,
    reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE reset_date <= now();
END;
$$;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credit(
  p_user_id uuid,
  p_conversation_id uuid DEFAULT NULL,
  p_message_id uuid DEFAULT NULL,
  p_usage_type text DEFAULT 'chat'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_used integer;
  v_total_credits integer;
BEGIN
  -- Get current credits
  SELECT used_credits, total_credits
  INTO v_current_used, v_total_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has credits
  IF v_current_used >= v_total_credits THEN
    RETURN false;
  END IF;
  
  -- Deduct credit
  UPDATE public.user_credits
  SET 
    used_credits = used_credits + 1,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log usage
  INSERT INTO public.credit_usage_log (
    user_id,
    conversation_id,
    message_id,
    credits_used,
    usage_type
  )
  VALUES (
    p_user_id,
    p_conversation_id,
    p_message_id,
    1,
    p_usage_type
  );
  
  RETURN true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_usage_log_user_id ON public.credit_usage_log(user_id);
CREATE INDEX idx_credit_usage_log_created_at ON public.credit_usage_log(created_at DESC);