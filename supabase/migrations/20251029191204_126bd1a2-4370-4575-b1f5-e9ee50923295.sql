-- Create table for agent invite requests
CREATE TABLE IF NOT EXISTS public.agent_invite_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  x_profile text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.agent_invite_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert invite requests
CREATE POLICY "Anyone can submit invite requests"
  ON public.agent_invite_requests
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view invite requests
CREATE POLICY "Admins can view invite requests"
  ON public.agent_invite_requests
  FOR SELECT
  USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]));

-- Admins can update status
CREATE POLICY "Admins can update invite requests"
  ON public.agent_invite_requests
  FOR UPDATE
  USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['artolaya@gmail.com'::text, 'michael@dexterlearning.com'::text]));