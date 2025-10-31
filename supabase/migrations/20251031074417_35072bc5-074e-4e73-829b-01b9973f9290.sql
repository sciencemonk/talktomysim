-- Add DegenCapitalLLC to approved X creators
INSERT INTO public.approved_x_creators (username, notes)
VALUES ('DegenCapitalLLC', 'Added for X agent access')
ON CONFLICT (username) DO NOTHING;