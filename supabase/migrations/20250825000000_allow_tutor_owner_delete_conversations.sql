-- Allow tutor owners to delete conversations for their own tutors

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Delete policy for conversations
DROP POLICY IF EXISTS "Tutor owner can delete conversations for their tutors" ON public.conversations;
CREATE POLICY "Tutor owner can delete conversations for their tutors"
  ON public.conversations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.tutors t
      WHERE t.id = conversations.tutor_id
        AND t.user_id = auth.uid()
    )
  );

-- Optional: explicit delete policy for messages in case CASCADE interacts with RLS
DROP POLICY IF EXISTS "Tutor owner can delete messages via their tutors" ON public.messages;
CREATE POLICY "Tutor owner can delete messages via their tutors"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.tutors t ON t.id = c.tutor_id
      WHERE c.id = messages.conversation_id
        AND t.user_id = auth.uid()
    )
  );


