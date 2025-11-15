-- Create RLS policies for store-avatars bucket
CREATE POLICY "Allow public read access to store avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "Allow store owners to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-avatars' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow store owners to update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow store owners to delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);