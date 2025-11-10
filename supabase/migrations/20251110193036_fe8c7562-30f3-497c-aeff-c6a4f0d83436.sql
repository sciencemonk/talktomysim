-- Add new prompt fields for different conversation contexts
ALTER TABLE advisors 
ADD COLUMN IF NOT EXISTS creator_prompt TEXT,
ADD COLUMN IF NOT EXISTS stranger_prompt TEXT,
ADD COLUMN IF NOT EXISTS sim_to_sim_prompt TEXT;

COMMENT ON COLUMN advisors.creator_prompt IS 'System prompt when SIM talks to its creator - personal and accountability-focused';
COMMENT ON COLUMN advisors.stranger_prompt IS 'System prompt when SIM talks to strangers - representing ideal self';
COMMENT ON COLUMN advisors.sim_to_sim_prompt IS 'System prompt when SIM talks to other SIMs - collaborative and transactional';
COMMENT ON COLUMN advisors.prompt IS 'Legacy/default prompt - can be used as fallback';