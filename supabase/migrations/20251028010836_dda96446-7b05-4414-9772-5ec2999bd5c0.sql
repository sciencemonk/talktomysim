-- Drop existing constraints
ALTER TABLE public.sim_likes DROP CONSTRAINT IF EXISTS sim_likes_sim_id_session_id_key;
ALTER TABLE public.sim_likes DROP CONSTRAINT IF EXISTS sim_likes_sim_id_user_id_key;

-- Add ip_address column
ALTER TABLE public.sim_likes ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Create new unique constraint for IP-based likes (partial index)
CREATE UNIQUE INDEX IF NOT EXISTS sim_likes_sim_id_ip_address_key 
ON public.sim_likes(sim_id, ip_address) 
WHERE ip_address IS NOT NULL;

-- Create unique constraint for authenticated users (partial index)
CREATE UNIQUE INDEX IF NOT EXISTS sim_likes_sim_id_user_id_key 
ON public.sim_likes(sim_id, user_id) 
WHERE user_id IS NOT NULL;

-- Create index for IP address lookups
CREATE INDEX IF NOT EXISTS idx_sim_likes_ip_address ON public.sim_likes(ip_address) WHERE ip_address IS NOT NULL;