-- First, delete duplicate X AI agent offerings, keeping only the oldest one per agent
DELETE FROM x_agent_offerings
WHERE id IN (
  SELECT id 
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY agent_id ORDER BY created_at ASC) as rn
    FROM x_agent_offerings
    WHERE offering_type = 'agent'
  ) t
  WHERE t.rn > 1
);

-- Add a unique constraint to prevent future duplicates
-- One agent can only have one auto-generated X AI agent offering
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_agent_offering_per_agent 
ON x_agent_offerings (agent_id) 
WHERE offering_type = 'agent';