-- Force drop all store-avatars related policies with different variations
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname ILIKE '%store%avatar%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects CASCADE';
    END LOOP;
END $$;

-- Now create the new simplified policies
CREATE POLICY "store_avatars_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'store-avatars');

CREATE POLICY "store_avatars_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-avatars');