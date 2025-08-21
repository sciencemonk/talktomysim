
-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table to store source documents for advisors
CREATE TABLE public.advisor_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'txt', 'docx', etc.
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store vector embeddings of text chunks
CREATE TABLE public.advisor_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.advisor_documents(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Position of chunk within document
  embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional embeddings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient similarity searches
CREATE INDEX advisor_embeddings_advisor_id_idx ON public.advisor_embeddings(advisor_id);
CREATE INDEX advisor_embeddings_document_id_idx ON public.advisor_embeddings(document_id);
CREATE INDEX advisor_embeddings_embedding_idx ON public.advisor_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add RLS policies for advisor_documents
ALTER TABLE public.advisor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage advisor documents" 
  ON public.advisor_documents 
  FOR ALL 
  USING ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text))
  WITH CHECK ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text));

CREATE POLICY "Public read access to advisor documents" 
  ON public.advisor_documents 
  FOR SELECT 
  USING (true);

-- Add RLS policies for advisor_embeddings
ALTER TABLE public.advisor_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage advisor embeddings" 
  ON public.advisor_embeddings 
  FOR ALL 
  USING ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text))
  WITH CHECK ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text));

CREATE POLICY "Public read access to advisor embeddings" 
  ON public.advisor_embeddings 
  FOR SELECT 
  USING (true);

-- Create function to search similar embeddings
CREATE OR REPLACE FUNCTION search_advisor_embeddings(
  query_embedding vector(1536),
  target_advisor_id uuid,
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float
)
LANGUAGE sql
STABLE
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
