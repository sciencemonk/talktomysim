
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT NOT NULL,
  passcode TEXT NOT NULL,
  parent_first_name TEXT,
  parent_last_name TEXT,
  parent_email TEXT,
  student_first_name TEXT,
  student_last_name TEXT,
  student_dob DATE,
  wallet_address TEXT,
  total_bananas INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false
);

-- Create tutors table for AI agents/tutors
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'General Tutor',
  status TEXT NOT NULL DEFAULT 'draft',
  model TEXT DEFAULT 'GPT-4',
  voice TEXT,
  voice_provider TEXT,
  custom_voice_id TEXT,
  voice_traits JSONB DEFAULT '[]'::jsonb,
  channels JSONB DEFAULT '[]'::jsonb,
  channel_configs JSONB DEFAULT '{}'::jsonb,
  interactions INTEGER DEFAULT 0,
  students_saved INTEGER DEFAULT 0,
  helpfulness_score NUMERIC DEFAULT 0,
  avm_score NUMERIC DEFAULT 0,
  csat NUMERIC DEFAULT 0,
  performance NUMERIC DEFAULT 0,
  is_personal BOOLEAN DEFAULT true,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  purpose TEXT,
  prompt TEXT,
  subject TEXT,
  grade_level TEXT,
  teaching_style TEXT,
  custom_subject TEXT,
  learning_objective TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_advisors table for user's selected advisors
CREATE TABLE public.user_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  avatar_url TEXT,
  category TEXT,
  background_content TEXT,
  knowledge_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, advisor_id)
);

-- Create conversations table for chat sessions
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL,
  advisor_id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for tutors
CREATE POLICY "Users can view their own tutors"
  ON public.tutors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow public read access to tutors"
  ON public.tutors FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own tutors"
  ON public.tutors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutors"
  ON public.tutors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tutors"
  ON public.tutors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_advisors
CREATE POLICY "Users can view their own advisors"
  ON public.user_advisors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advisors"
  ON public.user_advisors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisors"
  ON public.user_advisors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advisors"
  ON public.user_advisors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  ));

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    passcode,
    parent_first_name,
    parent_last_name,
    parent_email,
    student_first_name,
    student_last_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'passcode', '0000'),
    NEW.raw_user_meta_data->>'parent_first_name',
    NEW.raw_user_meta_data->>'parent_last_name',
    NEW.raw_user_meta_data->>'parent_email',
    NEW.raw_user_meta_data->>'student_first_name',
    NEW.raw_user_meta_data->>'student_last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update conversation timestamp when messages are added
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at
  BEFORE UPDATE ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_advisors_updated_at
  BEFORE UPDATE ON public.user_advisors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
