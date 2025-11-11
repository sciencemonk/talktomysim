-- Create sim_actions table
CREATE TABLE public.sim_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sim_id UUID NOT NULL REFERENCES public.sims(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  end_goal TEXT NOT NULL,
  usdc_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sim_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view actions for their own SIMs
CREATE POLICY "Users can view their own SIM actions"
ON public.sim_actions
FOR SELECT
USING (
  sim_id IN (
    SELECT id FROM public.sims WHERE user_id = auth.uid()
  )
);

-- Policy: Anyone can view actions for public SIMs
CREATE POLICY "Anyone can view public SIM actions"
ON public.sim_actions
FOR SELECT
USING (
  sim_id IN (
    SELECT id FROM public.sims WHERE is_public = true
  )
);

-- Policy: Users can create actions for their own SIMs
CREATE POLICY "Users can create their own SIM actions"
ON public.sim_actions
FOR INSERT
WITH CHECK (
  sim_id IN (
    SELECT id FROM public.sims WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update actions for their own SIMs
CREATE POLICY "Users can update their own SIM actions"
ON public.sim_actions
FOR UPDATE
USING (
  sim_id IN (
    SELECT id FROM public.sims WHERE user_id = auth.uid()
  )
);

-- Policy: Users can delete actions for their own SIMs
CREATE POLICY "Users can delete their own SIM actions"
ON public.sim_actions
FOR DELETE
USING (
  sim_id IN (
    SELECT id FROM public.sims WHERE user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_sim_actions_sim_id ON public.sim_actions(sim_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sim_actions_updated_at
BEFORE UPDATE ON public.sim_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();