-- Create table for user-generated debate requests
CREATE TABLE IF NOT EXISTS public.debate_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sim1_id UUID NOT NULL,
  sim2_id UUID NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  voter_name TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- Enable RLS
ALTER TABLE public.debate_queue ENABLE ROW LEVEL SECURITY;

-- Anyone can read debates
CREATE POLICY "Anyone can read debate queue"
ON public.debate_queue
FOR SELECT
USING (true);

-- Anyone can create debate requests
CREATE POLICY "Anyone can create debate requests"
ON public.debate_queue
FOR INSERT
WITH CHECK (true);

-- Only system can update debate status
CREATE POLICY "System can update debate queue"
ON public.debate_queue
FOR UPDATE
USING (true);

-- Create index for efficient querying
CREATE INDEX idx_debate_queue_status ON public.debate_queue(status, created_at);

-- Add foreign key references to advisors table
ALTER TABLE public.debate_queue
ADD CONSTRAINT fk_sim1 FOREIGN KEY (sim1_id) REFERENCES public.advisors(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_sim2 FOREIGN KEY (sim2_id) REFERENCES public.advisors(id) ON DELETE CASCADE;