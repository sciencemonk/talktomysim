
-- Create a table for global advisors that all users can see
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  avatar_url TEXT,
  category TEXT,
  background_content TEXT,
  knowledge_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read advisors
CREATE POLICY "All users can view advisors" 
  ON public.advisors 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only allow artolaya@gmail.com to insert, update, and delete advisors
CREATE POLICY "Only admin can manage advisors" 
  ON public.advisors 
  FOR ALL 
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'artolaya@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'artolaya@gmail.com');

-- Add trigger to update the updated_at column
CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
