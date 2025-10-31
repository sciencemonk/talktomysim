-- Create table for approved X agent creators
CREATE TABLE IF NOT EXISTS public.approved_x_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.approved_x_creators ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read the list of approved creators (needed for validation)
CREATE POLICY "Anyone can view approved X creators"
ON public.approved_x_creators
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only specific admins can manage approved creators (using email check)
CREATE POLICY "Only admins can manage approved X creators"
ON public.approved_x_creators
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email') = ANY (ARRAY['artolaya@gmail.com', 'michael@dexterlearning.com'])
)
WITH CHECK (
  (auth.jwt() ->> 'email') = ANY (ARRAY['artolaya@gmail.com', 'michael@dexterlearning.com'])
);

-- Create function to check if a username is an approved X creator
CREATE OR REPLACE FUNCTION public.is_approved_x_creator(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.approved_x_creators
    WHERE LOWER(username) = LOWER(check_username)
  );
$$;

-- Add policy to advisors table to restrict X agent creation
CREATE POLICY "Only approved creators can create X agents"
ON public.advisors
FOR INSERT
TO authenticated
WITH CHECK (
  -- If it's an X agent (Crypto Mail category), check if creator is approved
  CASE 
    WHEN sim_category = 'Crypto Mail' THEN
      EXISTS (
        SELECT 1 FROM public.approved_x_creators axc
        WHERE LOWER(axc.username) = LOWER(
          COALESCE(
            (social_links->>'x_username')::text,
            (social_links->>'twitter_username')::text,
            name
          )
        )
      )
    ELSE true  -- Non-X agents can be created normally
  END
);

-- Insert mrjethroknights as the first approved creator
INSERT INTO public.approved_x_creators (username, notes)
VALUES ('mrjethroknights', 'Initial approved X agent creator')
ON CONFLICT (username) DO NOTHING;