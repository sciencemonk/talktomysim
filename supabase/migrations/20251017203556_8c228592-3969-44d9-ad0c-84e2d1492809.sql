-- Initialize credits for all existing users who don't have a credits record yet
INSERT INTO public.user_credits (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;