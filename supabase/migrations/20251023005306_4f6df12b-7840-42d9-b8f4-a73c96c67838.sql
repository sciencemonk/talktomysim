-- Create function to update sim with edit code
CREATE OR REPLACE FUNCTION public.update_sim_with_code(
  p_sim_id UUID,
  p_edit_code TEXT,
  p_name TEXT,
  p_category TEXT,
  p_description TEXT,
  p_prompt TEXT,
  p_welcome_message TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_social_links JSONB DEFAULT NULL,
  p_integrations JSONB DEFAULT '[]'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_sim_id 
    AND edit_code = p_edit_code
  ) THEN
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