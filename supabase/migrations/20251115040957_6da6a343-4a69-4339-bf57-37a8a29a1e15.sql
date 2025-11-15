-- Add fields for agent configuration sliders to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS response_length integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS personality_warmth integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS expertise_level integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS agent_prompt text;

-- Add comment explaining the fields
COMMENT ON COLUMN stores.response_length IS 'Agent response length preference: 0-33 = short, 34-66 = medium, 67-100 = long';
COMMENT ON COLUMN stores.personality_warmth IS 'Agent personality warmth: 0-33 = formal, 34-66 = friendly, 67-100 = enthusiastic';
COMMENT ON COLUMN stores.expertise_level IS 'Agent product expertise level: 0-33 = basic, 34-66 = intermediate, 67-100 = expert';
COMMENT ON COLUMN stores.agent_prompt IS 'Generated system prompt for the AI agent based on configuration';