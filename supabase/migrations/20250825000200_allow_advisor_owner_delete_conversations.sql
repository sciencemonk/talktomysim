-- Allow advisor owners (advisors.user_id) to delete conversations/messages/captures

-- Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_captures ENABLE ROW LEVEL SECURITY;

-- Conversations: delete when the current user owns the advisor referenced by tutor_id
DROP POLICY IF EXISTS "Advisor owner can delete conversations" ON public.conversations;
CREATE POLICY "Advisor owner can delete conversations"
  ON public.conversations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.advisors a
      WHERE a.id = conversations.tutor_id
        AND a.user_id = auth.uid()
    )
  );

-- Messages: delete when the conversation belongs to an advisor owned by the user
DROP POLICY IF EXISTS "Advisor owner can delete messages via advisors" ON public.messages;
CREATE POLICY "Advisor owner can delete messages via advisors"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.advisors a ON a.id = c.tutor_id
      WHERE c.id = messages.conversation_id
        AND a.user_id = auth.uid()
    )
  );

-- Conversation captures: delete when the conversation belongs to an advisor owned by the user
DROP POLICY IF EXISTS "Advisor owner can delete conversation captures via advisors" ON public.conversation_captures;
CREATE POLICY "Advisor owner can delete conversation captures via advisors"
  ON public.conversation_captures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.advisors a ON a.id = c.tutor_id
      WHERE c.id = conversation_captures.conversation_id
        AND a.user_id = auth.uid()
    )
  );


