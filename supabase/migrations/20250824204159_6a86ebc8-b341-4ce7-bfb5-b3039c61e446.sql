
-- Add policy to allow anonymous users to read public advisors
CREATE POLICY "Allow anonymous users to read public advisors" 
ON advisors FOR SELECT 
USING (is_public = true AND is_active = true);
