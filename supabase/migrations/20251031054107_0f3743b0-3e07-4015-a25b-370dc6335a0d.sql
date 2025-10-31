-- Create function to respond to X messages with edit code
CREATE OR REPLACE FUNCTION public.respond_to_x_message_with_code(
  p_message_id uuid,
  p_agent_id uuid,
  p_edit_code text,
  p_response text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate edit code matches the agent
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_agent_id 
    AND edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Update the message with the response
  UPDATE x_messages
  SET 
    response = p_response,
    response_at = now(),
    updated_at = now()
  WHERE id = p_message_id
  AND agent_id = p_agent_id;

  RETURN TRUE;
END;
$$;