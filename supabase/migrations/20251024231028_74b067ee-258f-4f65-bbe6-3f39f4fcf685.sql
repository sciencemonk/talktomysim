-- Create a secure function to get contact messages with edit code validation
CREATE OR REPLACE FUNCTION public.get_contact_messages_with_code(
  p_advisor_id uuid,
  p_edit_code text
)
RETURNS TABLE (
  id uuid,
  advisor_id uuid,
  sender_email text,
  sender_phone text,
  message text,
  created_at timestamp with time zone,
  read boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Return messages
  RETURN QUERY
  SELECT 
    cm.id,
    cm.advisor_id,
    cm.sender_email,
    cm.sender_phone,
    cm.message,
    cm.created_at,
    cm.read
  FROM contact_messages cm
  WHERE cm.advisor_id = p_advisor_id
  ORDER BY cm.created_at DESC;
END;
$$;

-- Create a secure function to delete contact messages with edit code validation
CREATE OR REPLACE FUNCTION public.delete_contact_message_with_code(
  p_message_id uuid,
  p_advisor_id uuid,
  p_edit_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Delete message
  DELETE FROM contact_messages
  WHERE id = p_message_id
  AND advisor_id = p_advisor_id;

  RETURN TRUE;
END;
$$;

-- Create a secure function to mark message as read with edit code validation
CREATE OR REPLACE FUNCTION public.mark_contact_message_read_with_code(
  p_message_id uuid,
  p_advisor_id uuid,
  p_edit_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Mark as read
  UPDATE contact_messages
  SET read = true
  WHERE id = p_message_id
  AND advisor_id = p_advisor_id;

  RETURN TRUE;
END;
$$;