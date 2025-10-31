-- Create x_messages table for public message board
CREATE TABLE public.x_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL DEFAULT 0,
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.x_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Anyone can read x_messages"
ON public.x_messages
FOR SELECT
USING (true);

-- Allow anyone to insert messages (payment verified via session_id)
CREATE POLICY "Anyone can insert x_messages"
ON public.x_messages
FOR INSERT
WITH CHECK (true);

-- Only agent owners can update messages (to add responses)
CREATE POLICY "Agent owners can update x_messages"
ON public.x_messages
FOR UPDATE
USING (
  agent_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_x_messages_agent_id ON public.x_messages(agent_id);
CREATE INDEX idx_x_messages_created_at ON public.x_messages(created_at DESC);