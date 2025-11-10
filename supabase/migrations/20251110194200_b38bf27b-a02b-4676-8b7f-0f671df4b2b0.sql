-- Add prompt columns to sims table
ALTER TABLE sims 
ADD COLUMN IF NOT EXISTS creator_prompt text,
ADD COLUMN IF NOT EXISTS stranger_prompt text,
ADD COLUMN IF NOT EXISTS sim_to_sim_prompt text;