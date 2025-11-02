-- Add media_url column to x_agent_offerings table
ALTER TABLE public.x_agent_offerings 
ADD COLUMN media_url TEXT;

-- Create storage bucket for offering media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offering-media', 
  'offering-media', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Storage policies for offering media
CREATE POLICY "Anyone can view offering media"
ON storage.objects FOR SELECT
USING (bucket_id = 'offering-media');

CREATE POLICY "Authenticated users can upload offering media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'offering-media' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own offering media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'offering-media' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own offering media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'offering-media' 
  AND auth.uid() IS NOT NULL
);