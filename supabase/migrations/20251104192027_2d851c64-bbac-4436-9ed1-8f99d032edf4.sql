-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can upload offering media" ON storage.objects;

-- Allow anyone to upload offering media (edit code validation happens at app level)
CREATE POLICY "Anyone can upload offering media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'offering-media');

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own offering media" ON storage.objects;

-- Allow anyone to update offering media
CREATE POLICY "Anyone can update offering media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'offering-media')
WITH CHECK (bucket_id = 'offering-media');

-- Drop existing delete policy
DROP POLICY IF EXISTS "Users can delete their own offering media" ON storage.objects;

-- Allow anyone to delete offering media
CREATE POLICY "Anyone can delete offering media"
ON storage.objects FOR DELETE
USING (bucket_id = 'offering-media');