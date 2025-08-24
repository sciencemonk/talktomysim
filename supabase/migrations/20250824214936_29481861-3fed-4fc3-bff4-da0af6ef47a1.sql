
-- First, let's add the missing foreign key constraints to ensure data integrity
-- Add foreign key constraint from advisor_documents to advisors
ALTER TABLE advisor_documents 
ADD CONSTRAINT advisor_documents_advisor_id_fkey 
FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE;

-- Add foreign key constraint from advisor_embeddings to advisors  
ALTER TABLE advisor_embeddings 
ADD CONSTRAINT advisor_embeddings_advisor_id_fkey 
FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE;

-- Add foreign key constraint from advisor_embeddings to advisor_documents
ALTER TABLE advisor_embeddings 
ADD CONSTRAINT advisor_embeddings_document_id_fkey 
FOREIGN KEY (document_id) REFERENCES advisor_documents(id) ON DELETE CASCADE;

-- Update RLS policies for advisor_documents to allow users to manage their own advisor documents
DROP POLICY IF EXISTS "Users can manage their own advisor documents" ON advisor_documents;
CREATE POLICY "Users can manage their own advisor documents" 
ON advisor_documents 
FOR ALL 
USING (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Update RLS policies for advisor_embeddings to allow users to manage their own advisor embeddings
DROP POLICY IF EXISTS "Users can manage their own advisor embeddings" ON advisor_embeddings;
CREATE POLICY "Users can manage their own advisor embeddings" 
ON advisor_embeddings 
FOR ALL 
USING (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  advisor_id IN (
    SELECT id FROM advisors WHERE user_id = auth.uid()
  )
);

-- Ensure the vector extension is enabled for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Make sure the embedding column has the correct type (if not already set)
-- This assumes embeddings are 1536 dimensions (OpenAI ada-002 standard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'advisor_embeddings' 
    AND column_name = 'embedding' 
    AND udt_name = 'vector'
  ) THEN
    ALTER TABLE advisor_embeddings 
    ALTER COLUMN embedding TYPE vector(1536);
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS advisor_embeddings_advisor_id_idx ON advisor_embeddings(advisor_id);
CREATE INDEX IF NOT EXISTS advisor_embeddings_document_id_idx ON advisor_embeddings(document_id);
CREATE INDEX IF NOT EXISTS advisor_documents_advisor_id_idx ON advisor_documents(advisor_id);

-- Add HNSW index for vector similarity search (for better performance)
CREATE INDEX IF NOT EXISTS advisor_embeddings_embedding_idx ON advisor_embeddings 
USING hnsw (embedding vector_cosine_ops);
