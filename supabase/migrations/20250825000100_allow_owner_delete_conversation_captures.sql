-- Allow tutor owners to delete related conversation_captures for their tutors

ALTER TABLE public.conversation_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutor owner can delete conversation captures via their tutors" ON public.conversation_captures;
CREATE POLICY "Tutor owner can delete conversation captures via their tutors"
  ON public.conversation_captures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.tutors t ON t.id = c.tutor_id
      WHERE c.id = conversation_captures.conversation_id
        AND t.user_id = auth.uid()
    )
  );


