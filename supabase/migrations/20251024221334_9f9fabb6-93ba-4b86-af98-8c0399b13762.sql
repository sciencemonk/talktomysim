-- Rename the existing category field to marketplace_category to avoid confusion
ALTER TABLE public.advisors
RENAME COLUMN category TO marketplace_category;

-- Add a new field for sim functionality type (Chat vs Contact Me)
ALTER TABLE public.advisors
ADD COLUMN sim_category TEXT DEFAULT 'Chat' CHECK (sim_category IN ('Chat', 'Contact Me'));