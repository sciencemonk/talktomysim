-- Drop all possible existing store-avatars policies with CASCADE
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%store%avatar%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Now create the policies
CREATE POLICY "store_avatars_insert_policy"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_update_policy"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_delete_policy"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-avatars');