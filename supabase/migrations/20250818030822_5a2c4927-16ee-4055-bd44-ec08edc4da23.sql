
-- Allow public read access to tutors for shareable links
-- This will enable the /tutors/:agentId/chat route to work without authentication
CREATE POLICY "Allow public read access to tutors" 
  ON public.tutors 
  FOR SELECT 
  USING (true);
