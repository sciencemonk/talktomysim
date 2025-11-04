-- Add integrations column to x_agent_offerings table
ALTER TABLE x_agent_offerings 
ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN x_agent_offerings.integrations IS 'Array of enabled integrations for agent offerings';
