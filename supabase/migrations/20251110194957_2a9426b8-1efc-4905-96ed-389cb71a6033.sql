-- Allow anonymous SIM creation for development/testing
CREATE POLICY "Allow anonymous SIM creation" 
ON sims 
FOR INSERT 
WITH CHECK (true);