-- Create advisor_assets bucket for background images and other assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('advisor_assets', 'advisor_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for advisor_assets bucket
CREATE POLICY "Anyone can view advisor assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'advisor_assets');

CREATE POLICY "Users can upload their own advisor assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'advisor_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own advisor assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'advisor_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own advisor assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'advisor_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);