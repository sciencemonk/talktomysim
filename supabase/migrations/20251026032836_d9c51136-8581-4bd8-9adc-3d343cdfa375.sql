-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_contact_messages_with_code(uuid, text);
DROP FUNCTION IF EXISTS delete_contact_message_with_code(uuid, uuid, text);
DROP FUNCTION IF EXISTS mark_contact_message_read_with_code(uuid, uuid, text);

-- Create function to get contact messages with edit code verification
CREATE OR REPLACE FUNCTION get_contact_messages_with_code(
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
AS $$
BEGIN
  -- Verify edit code matches
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Return messages if code is valid
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

-- Create function to delete contact message with edit code verification
CREATE OR REPLACE FUNCTION delete_contact_message_with_code(
  p_message_id uuid,
  p_advisor_id uuid,
  p_edit_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify edit code matches
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Delete message if code is valid
  DELETE FROM contact_messages
  WHERE id = p_message_id AND advisor_id = p_advisor_id;
END;
$$;

-- Create function to mark contact message as read with edit code verification
CREATE OR REPLACE FUNCTION mark_contact_message_read_with_code(
  p_message_id uuid,
  p_advisor_id uuid,
  p_edit_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify edit code matches
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Update message if code is valid
  UPDATE contact_messages
  SET read = true
  WHERE id = p_message_id AND advisor_id = p_advisor_id;
END;
$$;