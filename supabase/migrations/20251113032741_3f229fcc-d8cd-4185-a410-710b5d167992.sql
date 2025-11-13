-- Create storage bucket for store avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-avatars', 'store-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for store avatars
CREATE POLICY "Anyone can view store avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-avatars');

CREATE POLICY "Authenticated users can upload their store avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own store avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own store avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add avatar_url column to stores table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE stores ADD COLUMN avatar_url TEXT;
  END IF;
END $$;