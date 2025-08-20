
-- Create a table to store user's saved advisors (copied from the advisors table)
CREATE TABLE public.user_advisors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  advisor_id uuid NOT NULL, -- Reference to the original advisor
  name text NOT NULL,
  title text,
  description text,
  prompt text NOT NULL,
  avatar_url text,
  category text,
  background_content text,
  knowledge_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, advisor_id) -- Prevent duplicates
);

-- Enable RLS
ALTER TABLE public.user_advisors ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_advisors
CREATE POLICY "Users can view their own advisors" 
  ON public.user_advisors 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advisors" 
  ON public.user_advisors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisors" 
  ON public.user_advisors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advisors" 
  ON public.user_advisors 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update the conversations table to use advisor_id instead of tutor_id
ALTER TABLE public.conversations 
ADD COLUMN advisor_id uuid;

-- Update existing conversations to use the new column (if any exist)
UPDATE public.conversations 
SET advisor_id = tutor_id 
WHERE tutor_id IS NOT NULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_advisors_updated_at 
    BEFORE UPDATE ON public.user_advisors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
