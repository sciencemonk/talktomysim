-- Create store-avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-avatars', 'store-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Store avatars are publicly accessible" ON storage.objects;

-- Allow users to upload their own store avatars
CREATE POLICY "Users can upload their own store avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own store avatars
CREATE POLICY "Users can update their own store avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own store avatars
CREATE POLICY "Users can delete their own store avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Make store avatars publicly readable
CREATE POLICY "Store avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-avatars');