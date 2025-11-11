-- Add interaction model fields to sims table
ALTER TABLE public.sims 
ADD COLUMN IF NOT EXISTS interaction_style TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS exploration_style TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS primary_objective TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS interaction_autonomy INTEGER DEFAULT 5 CHECK (interaction_autonomy >= 0 AND interaction_autonomy <= 10),
ADD COLUMN IF NOT EXISTS exploration_frequency INTEGER DEFAULT 5 CHECK (exploration_frequency >= 0 AND exploration_frequency <= 10),
ADD COLUMN IF NOT EXISTS objective_focus INTEGER DEFAULT 5 CHECK (objective_focus >= 0 AND objective_focus <= 10);