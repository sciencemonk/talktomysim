-- Create sim_likes table for tracking likes on sims
CREATE TABLE IF NOT EXISTS public.sim_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For anonymous likes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sim_id, user_id), -- Prevent duplicate likes from same user
  UNIQUE(sim_id, session_id) -- Prevent duplicate likes from same session
);

-- Create index for faster lookups
CREATE INDEX idx_sim_likes_sim_id ON public.sim_likes(sim_id);
CREATE INDEX idx_sim_likes_user_id ON public.sim_likes(user_id);
CREATE INDEX idx_sim_likes_session_id ON public.sim_likes(session_id);

-- Enable Row Level Security
ALTER TABLE public.sim_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
  ON public.sim_likes
  FOR SELECT
  USING (true);

-- Anyone can insert likes (authenticated or anonymous)
CREATE POLICY "Anyone can insert likes"
  ON public.sim_likes
  FOR INSERT
  WITH CHECK (true);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON public.sim_likes
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (session_id IS NOT NULL)
  );