-- Create table to track failed edit code attempts
CREATE TABLE IF NOT EXISTS public.edit_code_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  attempt_time timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_edit_code_attempts_agent_time 
ON public.edit_code_attempts(agent_id, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.edit_code_attempts ENABLE ROW LEVEL SECURITY;

-- Policy to allow the system to insert attempts
CREATE POLICY "System can insert edit code attempts"
ON public.edit_code_attempts
FOR INSERT
WITH CHECK (true);

-- Function to check rate limit (5 attempts per hour)
CREATE OR REPLACE FUNCTION public.check_edit_code_rate_limit(p_agent_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_count integer;
BEGIN
  -- Count attempts in the last hour
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.edit_code_attempts
  WHERE agent_id = p_agent_id
    AND attempt_time > now() - interval '1 hour';
  
  -- Return true if under limit (5 attempts)
  RETURN v_attempt_count < 5;
END;
$$;

-- Function to record failed attempt
CREATE OR REPLACE FUNCTION public.record_failed_edit_code_attempt(p_agent_id uuid, p_ip_address text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.edit_code_attempts (agent_id, ip_address)
  VALUES (p_agent_id, p_ip_address);
  
  -- Clean up old attempts (older than 1 hour)
  DELETE FROM public.edit_code_attempts
  WHERE attempt_time < now() - interval '1 hour';
END;
$$;

-- Update the existing validation functions to include rate limiting

-- Update update_sim_with_code function
CREATE OR REPLACE FUNCTION public.update_sim_with_code(
  p_sim_id uuid,
  p_edit_code text,
  p_name text,
  p_category text,
  p_description text,
  p_prompt text,
  p_welcome_message text,
  p_avatar_url text DEFAULT NULL,
  p_social_links jsonb DEFAULT NULL,
  p_integrations jsonb DEFAULT '[]'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_valid boolean;
BEGIN
  -- Check rate limit first
  IF NOT public.check_edit_code_rate_limit(p_sim_id) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many failed attempts. Please try again later.';
  END IF;

  -- Check if edit code is valid
  SELECT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_sim_id 
    AND edit_code = p_edit_code
  ) INTO v_code_valid;

  -- If code is invalid, record the failed attempt
  IF NOT v_code_valid THEN
    PERFORM public.record_failed_edit_code_attempt(p_sim_id);
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Update the sim
  UPDATE advisors
  SET 
    name = p_name,
    category = p_category,
    description = p_description,
    prompt = p_prompt,
    welcome_message = p_welcome_message,
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    social_links = p_social_links,
    integrations = p_integrations,
    updated_at = now()
  WHERE id = p_sim_id;

  RETURN TRUE;
END;
$$;

-- Update get_contact_messages_with_code function
CREATE OR REPLACE FUNCTION public.get_contact_messages_with_code(p_advisor_id uuid, p_edit_code text)
RETURNS TABLE(id uuid, advisor_id uuid, sender_email text, sender_phone text, message text, created_at timestamp with time zone, read boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_valid boolean;
BEGIN
  -- Check rate limit
  IF NOT public.check_edit_code_rate_limit(p_advisor_id) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many failed attempts. Please try again later.';
  END IF;

  -- Verify edit code matches
  SELECT EXISTS (
    SELECT 1 FROM advisors 
    WHERE advisors.id = p_advisor_id 
    AND advisors.edit_code = p_edit_code
  ) INTO v_code_valid;

  IF NOT v_code_valid THEN
    PERFORM public.record_failed_edit_code_attempt(p_advisor_id);
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

-- Update manage_offering_with_code function
CREATE OR REPLACE FUNCTION public.manage_offering_with_code(
  p_agent_id uuid,
  p_edit_code text,
  p_offering_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_delivery_method text DEFAULT NULL,
  p_required_info jsonb DEFAULT NULL,
  p_is_active boolean DEFAULT true,
  p_operation text DEFAULT 'insert'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_offering_id uuid;
  v_code_valid boolean;
BEGIN
  -- Check rate limit
  IF NOT public.check_edit_code_rate_limit(p_agent_id) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many failed attempts. Please try again later.';
  END IF;

  -- Validate edit code
  SELECT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_agent_id 
    AND edit_code = p_edit_code
  ) INTO v_code_valid;

  IF NOT v_code_valid THEN
    PERFORM public.record_failed_edit_code_attempt(p_agent_id);
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  -- Perform the requested operation
  IF p_operation = 'insert' THEN
    INSERT INTO x_agent_offerings (
      agent_id,
      title,
      description,
      price,
      delivery_method,
      required_info,
      is_active
    ) VALUES (
      p_agent_id,
      p_title,
      p_description,
      p_price,
      p_delivery_method,
      p_required_info,
      p_is_active
    )
    RETURNING id INTO v_offering_id;
    
    v_result := jsonb_build_object('id', v_offering_id, 'operation', 'insert', 'success', true);
    
  ELSIF p_operation = 'update' THEN
    UPDATE x_agent_offerings
    SET 
      title = COALESCE(p_title, title),
      description = COALESCE(p_description, description),
      price = COALESCE(p_price, price),
      delivery_method = COALESCE(p_delivery_method, delivery_method),
      required_info = COALESCE(p_required_info, required_info),
      is_active = COALESCE(p_is_active, is_active),
      updated_at = now()
    WHERE id = p_offering_id
    AND agent_id = p_agent_id;
    
    v_result := jsonb_build_object('id', p_offering_id, 'operation', 'update', 'success', true);
    
  ELSIF p_operation = 'delete' THEN
    DELETE FROM x_agent_offerings
    WHERE id = p_offering_id
    AND agent_id = p_agent_id;
    
    v_result := jsonb_build_object('id', p_offering_id, 'operation', 'delete', 'success', true);
    
  ELSE
    RAISE EXCEPTION 'Invalid operation. Must be insert, update, or delete';
  END IF;

  RETURN v_result;
END;
$$;