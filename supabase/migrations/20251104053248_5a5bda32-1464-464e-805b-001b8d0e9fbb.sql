-- Drop ALL existing policies on advisors
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'advisors' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.advisors';
    END LOOP;
END $$;

-- Create the simplest possible INSERT policy that allows everything
CREATE POLICY "allow_all_advisor_inserts"
ON public.advisors
FOR INSERT
TO public
WITH CHECK (true);

-- Create simple SELECT policies
CREATE POLICY "allow_all_advisor_reads"
ON public.advisors
FOR SELECT
TO public
USING (true);

-- Create simple UPDATE policies
CREATE POLICY "allow_all_advisor_updates"
ON public.advisors
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create simple DELETE policies  
CREATE POLICY "allow_all_advisor_deletes"
ON public.advisors
FOR DELETE
TO public
USING (true);