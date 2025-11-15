-- Storage policies for store-avatars bucket

-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload store avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public can view store avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-avatars');

-- Allow users to update their own files
CREATE POLICY "Users can update their store avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'store-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their store avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);