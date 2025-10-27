-- Allow public read access to daily briefs
CREATE POLICY "Allow public read access to daily briefs" 
ON public.daily_briefs 
FOR SELECT 
USING (true);