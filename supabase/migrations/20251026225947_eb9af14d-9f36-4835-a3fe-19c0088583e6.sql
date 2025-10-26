-- Create table for storing daily briefs
CREATE TABLE IF NOT EXISTS public.daily_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  brief_content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_time TIME NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.daily_briefs ENABLE ROW LEVEL SECURITY;

-- Allow advisor owners to view their daily briefs
CREATE POLICY "Advisor owners can view their daily briefs"
ON public.daily_briefs
FOR SELECT
USING (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Allow advisor owners to delete their daily briefs
CREATE POLICY "Advisor owners can delete their daily briefs"
ON public.daily_briefs
FOR DELETE
USING (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Allow advisor owners to update their daily briefs
CREATE POLICY "Advisor owners can update their daily briefs"
ON public.daily_briefs
FOR UPDATE
USING (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Allow system to insert daily briefs
CREATE POLICY "System can insert daily briefs"
ON public.daily_briefs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_daily_briefs_advisor_id ON public.daily_briefs(advisor_id);
CREATE INDEX idx_daily_briefs_scheduled_time ON public.daily_briefs(scheduled_time);