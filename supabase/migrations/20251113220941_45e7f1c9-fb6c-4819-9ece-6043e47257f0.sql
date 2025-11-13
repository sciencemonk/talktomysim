-- First, drop ALL existing store-avatars policies
DROP POLICY IF EXISTS "Users can upload their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Store avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete store avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view store avatars" ON storage.objects;

-- Create new policies that work with anon users (Coinbase auth)
CREATE POLICY "Public can upload store avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'store-avatars');

CREATE POLICY "Public can update store avatars"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "Public can delete store avatars"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "Public can view store avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-avatars');