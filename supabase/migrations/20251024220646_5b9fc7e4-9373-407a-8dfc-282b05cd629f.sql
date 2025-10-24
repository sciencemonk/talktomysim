-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  sender_email TEXT,
  sender_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Advisor owners can view messages for their advisors
CREATE POLICY "Advisor owners can view their contact messages"
ON public.contact_messages
FOR SELECT
USING (
  advisor_id IN (
    SELECT id FROM public.advisors WHERE user_id = auth.uid()
  )
);

-- Policy: Anyone can create contact messages for public advisors
CREATE POLICY "Anyone can create contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  advisor_id IN (
    SELECT id FROM public.advisors WHERE is_active = true
  )
);

-- Policy: Advisor owners can update messages (e.g., mark as read)
CREATE POLICY "Advisor owners can update their contact messages"
ON public.contact_messages
FOR UPDATE
USING (
  advisor_id IN (
    SELECT id FROM public.advisors WHERE user_id = auth.uid()
  )
);

-- Policy: Advisor owners can delete their contact messages
CREATE POLICY "Advisor owners can delete their contact messages"
ON public.contact_messages
FOR DELETE
USING (
  advisor_id IN (
    SELECT id FROM public.advisors WHERE user_id = auth.uid()
  )
);

-- Add category field to advisors table
ALTER TABLE public.advisors
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Chat';