
-- Create document_versions table for storing document version history
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.advisor_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  file_size INTEGER,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(document_id, version_number)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since advisor_documents is public read)
CREATE POLICY "Public read access to document versions" 
  ON public.document_versions 
  FOR SELECT 
  USING (true);

-- Create policy for admin management
CREATE POLICY "Admin can manage document versions" 
  ON public.document_versions 
  FOR ALL 
  USING ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text))
  WITH CHECK ((auth.uid() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = 'artolaya@gmail.com'::text));

-- Create index for better query performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_version_number ON public.document_versions(document_id, version_number DESC);
