
-- Create a table for tutors/agents
CREATE TABLE public.tutors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'General Tutor',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  subject TEXT,
  grade_level TEXT,
  teaching_style TEXT,
  custom_subject TEXT,
  learning_objective TEXT,
  purpose TEXT,
  prompt TEXT,
  model TEXT DEFAULT 'GPT-4',
  voice TEXT,
  voice_provider TEXT,
  custom_voice_id TEXT,
  avatar TEXT,
  phone TEXT,
  email TEXT,
  channels JSONB DEFAULT '[]'::jsonb,
  channel_configs JSONB DEFAULT '{}'::jsonb,
  voice_traits JSONB DEFAULT '[]'::jsonb,
  interactions INTEGER DEFAULT 0,
  students_saved INTEGER DEFAULT 0,
  helpfulness_score DECIMAL(3,1) DEFAULT 0,
  avm_score DECIMAL(3,1) DEFAULT 0,
  csat DECIMAL(3,1) DEFAULT 0,
  performance DECIMAL(3,1) DEFAULT 0,
  is_personal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tutors
CREATE POLICY "Users can view their own tutors" 
  ON public.tutors 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tutors" 
  ON public.tutors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutors" 
  ON public.tutors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tutors" 
  ON public.tutors 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_tutors_updated_at
  BEFORE UPDATE ON public.tutors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
