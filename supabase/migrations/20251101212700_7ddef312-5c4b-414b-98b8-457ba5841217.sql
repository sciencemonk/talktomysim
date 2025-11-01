-- Create table for X agent store offerings
CREATE TABLE public.x_agent_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  delivery_method TEXT NOT NULL,
  required_info JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for store purchases
CREATE TABLE public.x_agent_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID NOT NULL REFERENCES public.x_agent_offerings(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL,
  buyer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.x_agent_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x_agent_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offerings
CREATE POLICY "Anyone can view active offerings"
  ON public.x_agent_offerings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Agent owners can manage their offerings"
  ON public.x_agent_offerings
  FOR ALL
  USING (agent_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  ))
  WITH CHECK (agent_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  ));

-- RLS Policies for purchases
CREATE POLICY "Anyone can create purchases"
  ON public.x_agent_purchases
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Agent owners can view their purchases"
  ON public.x_agent_purchases
  FOR SELECT
  USING (agent_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agent owners can update their purchases"
  ON public.x_agent_purchases
  FOR UPDATE
  USING (agent_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_x_agent_offerings_agent_id ON public.x_agent_offerings(agent_id);
CREATE INDEX idx_x_agent_offerings_active ON public.x_agent_offerings(is_active);
CREATE INDEX idx_x_agent_purchases_agent_id ON public.x_agent_purchases(agent_id);
CREATE INDEX idx_x_agent_purchases_offering_id ON public.x_agent_purchases(offering_id);
CREATE INDEX idx_x_agent_purchases_session_id ON public.x_agent_purchases(session_id);

-- Trigger for updated_at
CREATE TRIGGER update_x_agent_offerings_updated_at
  BEFORE UPDATE ON public.x_agent_offerings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_x_agent_purchases_updated_at
  BEFORE UPDATE ON public.x_agent_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();