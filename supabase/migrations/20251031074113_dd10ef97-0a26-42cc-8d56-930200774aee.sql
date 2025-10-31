-- Drop the broken RLS policy that allows updates without validating the edit code
DROP POLICY IF EXISTS "Allow updates with valid edit code" ON public.advisors;

-- Note: This policy was checking IF edit_code IS NOT NULL but not validating the actual code
-- The client-side code in EditSimModal.tsx now properly validates the code in the WHERE clause
-- Users can still view/read sims via existing SELECT policies
-- Updates are protected by "Users can manage their own advisors" policy for authenticated owners