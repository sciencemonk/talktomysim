-- Delete Michael Olaya from advisors
DELETE FROM advisors WHERE id = '105b8a38-0ba3-42dc-85bb-9d432554aba3';

-- Update RLS policies to allow michael@dexterlearning.com admin access
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admin can manage advisors" ON advisors;
DROP POLICY IF EXISTS "Admin full access to advisor documents" ON advisor_documents;
DROP POLICY IF EXISTS "Admin full access to advisor embeddings" ON advisor_embeddings;
DROP POLICY IF EXISTS "Admin can manage document versions" ON document_versions;
DROP POLICY IF EXISTS "Admin can view form submissions" ON form_submissions;

-- Create updated admin policies for advisors
CREATE POLICY "Admin can manage advisors" ON advisors
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'))
WITH CHECK ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'));

-- Create updated admin policies for advisor_documents
CREATE POLICY "Admin full access to advisor documents" ON advisor_documents
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'))
WITH CHECK ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'));

-- Create updated admin policies for advisor_embeddings
CREATE POLICY "Admin full access to advisor embeddings" ON advisor_embeddings
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'))
WITH CHECK ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'));

-- Create updated admin policies for document_versions
CREATE POLICY "Admin can manage document versions" ON document_versions
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'))
WITH CHECK ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'));

-- Create updated admin policies for form_submissions
CREATE POLICY "Admin can view form submissions" ON form_submissions
FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com'));

-- Update the existing "Users can manage their own advisors" policy to include admin access
DROP POLICY IF EXISTS "Users can manage their own advisors" ON advisors;
CREATE POLICY "Users can manage their own advisors" ON advisors
FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com')))
WITH CHECK ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) IN ('artolaya@gmail.com', 'michael@dexterlearning.com')));