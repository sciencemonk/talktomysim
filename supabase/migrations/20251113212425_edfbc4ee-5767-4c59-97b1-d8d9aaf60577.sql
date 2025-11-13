-- Add INSERT policy for store avatars uploads
CREATE POLICY "Users can upload their own store avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);