-- Allow anonymous users to upload avatars
-- First, drop the existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow users to upload avatars" ON storage.objects;

-- Create a new policy that allows anyone (authenticated or not) to upload to the avatars bucket
CREATE POLICY "Anyone can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Ensure the existing public read access policy exists
-- (This should already exist based on the linter output)
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');