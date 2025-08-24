-- Fix security definer view issues by ensuring views use proper security context

-- First, let's check if there are any SECURITY DEFINER functions that need fixing
-- Update the handle_new_user function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_escalation_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the search_advisor_embeddings function to have proper search_path
CREATE OR REPLACE FUNCTION public.search_advisor_embeddings(query_embedding extensions.vector, target_advisor_id uuid, similarity_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10)
RETURNS TABLE(id uuid, document_id uuid, chunk_text text, similarity double precision)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    ae.id,
    ae.document_id,
    ae.chunk_text,
    1 - (ae.embedding <=> query_embedding) as similarity
  FROM advisor_embeddings ae
  WHERE ae.advisor_id = target_advisor_id
    AND 1 - (ae.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Ensure the public_advisors view is properly created without security definer issues
-- Drop and recreate to ensure clean state
DROP VIEW IF EXISTS public.public_advisors;

CREATE VIEW public.public_advisors AS
SELECT 
  id,
  name,
  title,
  description,
  avatar_url,
  category,
  is_public,
  is_active,
  is_verified,
  created_at,
  updated_at,
  custom_url,
  current_profession,
  years_experience,
  location
FROM public.advisors
WHERE is_public = true AND is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON public.public_advisors TO anon;
GRANT SELECT ON public.public_advisors TO authenticated;