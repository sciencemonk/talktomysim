
-- Add columns to advisors table to support comprehensive sim data
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS professional_title text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS current_profession text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS years_experience integer;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS areas_of_expertise text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS additional_background text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS custom_url text UNIQUE;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS welcome_message text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS sample_scenarios jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS completion_status jsonb DEFAULT '{"basic_info": false, "interaction_model": false, "core_knowledge": false}'::jsonb;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;

-- Create index on custom_url for fast lookups
CREATE INDEX IF NOT EXISTS idx_advisors_custom_url ON public.advisors(custom_url);
CREATE INDEX IF NOT EXISTS idx_advisors_user_id ON public.advisors(user_id);

-- Update RLS policies to include user-owned advisors
DROP POLICY IF EXISTS "Users can manage their own advisors" ON public.advisors;
CREATE POLICY "Users can manage their own advisors" 
  ON public.advisors 
  FOR ALL
  USING (auth.uid() = user_id OR (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text))
  WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text));
