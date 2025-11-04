-- Add agent_functionality column to x_agent_offerings table
ALTER TABLE x_agent_offerings 
ADD COLUMN IF NOT EXISTS agent_functionality text;