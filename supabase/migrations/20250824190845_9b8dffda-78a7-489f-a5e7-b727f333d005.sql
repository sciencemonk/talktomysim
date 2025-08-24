-- Fix remaining security vulnerabilities by removing public access to sensitive tables

-- 1. Fix advisor_documents table - remove public read access
DROP POLICY IF EXISTS "Public read access to advisor documents" ON public.advisor_documents;

-- Ensure only admin users can access advisor documents (since there's already an admin policy)
-- The existing "Admin can manage advisor documents" policy should be sufficient for authorized access

-- 2. Fix advisor_embeddings table - remove public read access  
DROP POLICY IF EXISTS "Public read access to advisor embeddings" ON public.advisor_embeddings;

-- Ensure only admin users can access advisor embeddings (since there's already an admin policy)
-- The existing "Admin can manage advisor embeddings" policy should be sufficient for authorized access

-- 3. Fix document_versions table - remove public read access
DROP POLICY IF EXISTS "Public read access to document versions" ON public.document_versions;

-- Ensure only admin users can access document versions (since there's already an admin policy)
-- The existing "Admin can manage document versions" policy should be sufficient for authorized access

-- 4. Double-check profiles table security (ensure no public policies exist)
DROP POLICY IF EXISTS "Public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;

-- The profiles table already has proper user-specific policies:
-- - Users can insert their own profile (auth.uid() = id)
-- - Users can update their own profile (auth.uid() = id) 
-- - Users can view their own profile (auth.uid() = id)
-- These policies ensure users can only access their own profile data