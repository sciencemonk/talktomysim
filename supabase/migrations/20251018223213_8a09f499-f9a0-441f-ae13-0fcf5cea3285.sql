-- Add personalization fields to advisors table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS expertise_areas TEXT,
ADD COLUMN IF NOT EXISTS personality_type TEXT DEFAULT 'friendly',
ADD COLUMN IF NOT EXISTS conversation_style TEXT DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS response_length TEXT DEFAULT 'medium';