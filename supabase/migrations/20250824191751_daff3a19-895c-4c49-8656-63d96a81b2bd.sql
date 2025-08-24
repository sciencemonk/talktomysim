-- Check for and fix remaining security definer and search path issues

-- First, let's fix the remaining function that likely doesn't have search_path set
-- This is likely the search_advisor_embeddings function that failed earlier

-- Let's update it carefully without touching the vector operations
CREATE OR REPLACE FUNCTION public.search_advisor_embeddings(
  query_embedding extensions.vector, 
  target_advisor_id uuid, 
  similarity_threshold double precision DEFAULT 0.7, 
  match_count integer DEFAULT 10
)
RETURNS TABLE(id uuid, document_id uuid, chunk_text text, similarity double precision)
LANGUAGE sql
STABLE
SET search_path = extensions, public
AS $$
  SELECT 
    ae.id,
    ae.document_id,
    ae.chunk_text,
    1 - (ae.embedding <=> query_embedding) as similarity
  FROM public.advisor_embeddings ae
  WHERE ae.advisor_id = target_advisor_id
    AND 1 - (ae.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Double-check that our public_advisors view is not a security definer view
-- Drop and recreate it explicitly as a regular view (not security definer)
DROP VIEW IF EXISTS public.public_advisors CASCADE;

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

-- Ensure proper permissions without making it a security definer
GRANT SELECT ON public.public_advisors TO anon;
GRANT SELECT ON public.public_advisors TO authenticated;