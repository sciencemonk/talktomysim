-- Enable realtime for conversations table
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add the conversations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Do the same for messages table since we may need it
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;