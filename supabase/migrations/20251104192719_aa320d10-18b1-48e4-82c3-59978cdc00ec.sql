-- Add columns for AI agent offerings
ALTER TABLE public.x_agent_offerings
ADD COLUMN IF NOT EXISTS agent_system_prompt text,
ADD COLUMN IF NOT EXISTS agent_data_source text,
ADD COLUMN IF NOT EXISTS agent_avatar_url text,
ADD COLUMN IF NOT EXISTS price_per_conversation numeric DEFAULT 0;