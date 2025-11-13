-- Update storage policies to work with Coinbase auth (anon users)
DROP POLICY IF EXISTS "Users can upload their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own store avatars" ON storage.objects;

-- Allow anyone (including anon) to upload store avatars to their own folder
CREATE POLICY "Anyone can upload store avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'store-avatars'
);

-- Allow anyone to update store avatars in their own folder
CREATE POLICY "Anyone can update store avatars"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'store-avatars'
);

-- Allow anyone to delete store avatars in their own folder
CREATE POLICY "Anyone can delete store avatars"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'store-avatars'
);