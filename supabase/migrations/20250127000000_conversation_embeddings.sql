-- Create table to store conversation embeddings for semantic analysis
CREATE TABLE public.conversation_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id VARCHAR NOT NULL, -- Support both UUID and public_ conversation IDs
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL, -- The full conversation content or summary
  content_type VARCHAR(20) NOT NULL DEFAULT 'full', -- 'full', 'summary', 'theme'
  participant_type VARCHAR(20), -- 'anonymous', 'authenticated', 'mixed'
  message_count INTEGER DEFAULT 0,
  conversation_date TIMESTAMP WITH TIME ZONE,
  embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional embeddings
  metadata JSONB, -- Store additional context (topics, sentiment, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient similarity searches and filtering
CREATE INDEX conversation_embeddings_advisor_id_idx ON public.conversation_embeddings(advisor_id);
CREATE INDEX conversation_embeddings_conversation_id_idx ON public.conversation_embeddings(conversation_id);
CREATE INDEX conversation_embeddings_date_idx ON public.conversation_embeddings(conversation_date);
CREATE INDEX conversation_embeddings_type_idx ON public.conversation_embeddings(content_type);

-- Vector similarity search index
CREATE INDEX conversation_embeddings_embedding_idx ON public.conversation_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Add RLS policies for conversation_embeddings
ALTER TABLE public.conversation_embeddings ENABLE ROW LEVEL SECURITY;

-- Admin policy
CREATE POLICY "Admin can manage conversation embeddings" 
  ON public.conversation_embeddings 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Owner policy - users can access embeddings for their own advisor's conversations
CREATE POLICY "Users can access their advisor's conversation embeddings" 
  ON public.conversation_embeddings 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advisors 
      WHERE advisors.id = conversation_embeddings.advisor_id 
      AND advisors.user_id = auth.uid()
    )
  );

-- Function to search conversation embeddings
CREATE OR REPLACE FUNCTION search_conversation_embeddings(
  query_embedding vector(1536),
  target_advisor_id uuid,
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  content_types text[] DEFAULT ARRAY['full', 'summary'],
  date_from timestamp with time zone DEFAULT NULL,
  date_to timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
  conversation_id varchar,
  content_text text,
  content_type varchar,
  message_count integer,
  conversation_date timestamp with time zone,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    ce.conversation_id,
    ce.content_text,
    ce.content_type,
    ce.message_count,
    ce.conversation_date,
    1 - (ce.embedding <=> query_embedding) as similarity,
    ce.metadata
  FROM conversation_embeddings ce
  WHERE ce.advisor_id = target_advisor_id
    AND ce.content_type = ANY(content_types)
    AND (1 - (ce.embedding <=> query_embedding)) > similarity_threshold
    AND (date_from IS NULL OR ce.conversation_date >= date_from)
    AND (date_to IS NULL OR ce.conversation_date <= date_to)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to get conversation insights summary
CREATE OR REPLACE FUNCTION get_conversation_insights(
  target_advisor_id uuid,
  days_back int DEFAULT 30
)
RETURNS TABLE (
  total_conversations bigint,
  total_messages bigint,
  avg_messages_per_conversation numeric,
  anonymous_conversations bigint,
  recent_themes jsonb
)
LANGUAGE sql STABLE
AS $$
  WITH stats AS (
    SELECT 
      COUNT(*) as total_convs,
      SUM(message_count) as total_msgs,
      AVG(message_count) as avg_msgs,
      COUNT(*) FILTER (WHERE participant_type = 'anonymous') as anon_convs
    FROM conversation_embeddings ce
    WHERE ce.advisor_id = target_advisor_id
      AND ce.content_type = 'full'
      AND ce.conversation_date >= NOW() - INTERVAL '1 day' * days_back
  ),
  themes AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'conversation_id', conversation_id,
        'date', conversation_date,
        'messages', message_count,
        'topics', metadata->'topics'
      )
    ) as theme_data
    FROM conversation_embeddings ce
    WHERE ce.advisor_id = target_advisor_id
      AND ce.content_type = 'full'
      AND ce.conversation_date >= NOW() - INTERVAL '1 day' * days_back
    ORDER BY conversation_date DESC
    LIMIT 20
  )
  SELECT 
    s.total_convs,
    s.total_msgs,
    s.avg_msgs,
    s.anon_convs,
    COALESCE(t.theme_data, '[]'::jsonb)
  FROM stats s
  CROSS JOIN themes t;
$$;
