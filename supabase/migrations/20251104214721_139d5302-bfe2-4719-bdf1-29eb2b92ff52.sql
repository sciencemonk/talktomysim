-- Update manage_offering_with_code function to support integrations
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
  p_operation text DEFAULT 'insert',
  p_offering_type text DEFAULT 'standard',
  p_agent_system_prompt text DEFAULT NULL,
  p_agent_data_source text DEFAULT NULL,
  p_agent_functionality text DEFAULT NULL,
  p_agent_avatar_url text DEFAULT NULL,
  p_price_per_conversation numeric DEFAULT 0,
  p_media_url text DEFAULT NULL,
  p_digital_file_url text DEFAULT NULL,
  p_blur_preview boolean DEFAULT false,
  p_integrations jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offering_id uuid;
  v_result jsonb;
BEGIN
  -- Verify edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_agent_id AND edit_code = p_edit_code
  ) THEN
    RAISE EXCEPTION 'Invalid edit code';
  END IF;

  IF p_operation = 'insert' THEN
    INSERT INTO x_agent_offerings (
      agent_id, title, description, price, delivery_method, 
      required_info, is_active, offering_type, agent_system_prompt,
      agent_data_source, agent_functionality, agent_avatar_url,
      price_per_conversation, media_url, digital_file_url, blur_preview,
      integrations
    ) VALUES (
      p_agent_id, p_title, p_description, p_price, p_delivery_method,
      p_required_info, p_is_active, p_offering_type, p_agent_system_prompt,
      p_agent_data_source, p_agent_functionality, p_agent_avatar_url,
      p_price_per_conversation, p_media_url, p_digital_file_url, p_blur_preview,
      p_integrations
    ) RETURNING id INTO v_offering_id;
    
    v_result := jsonb_build_object('id', v_offering_id, 'success', true);
    
  ELSIF p_operation = 'update' THEN
    UPDATE x_agent_offerings SET
      title = COALESCE(p_title, title),
      description = COALESCE(p_description, description),
      price = COALESCE(p_price, price),
      delivery_method = COALESCE(p_delivery_method, delivery_method),
      required_info = COALESCE(p_required_info, required_info),
      is_active = COALESCE(p_is_active, is_active),
      offering_type = COALESCE(p_offering_type, offering_type),
      agent_system_prompt = COALESCE(p_agent_system_prompt, agent_system_prompt),
      agent_data_source = COALESCE(p_agent_data_source, agent_data_source),
      agent_functionality = COALESCE(p_agent_functionality, agent_functionality),
      agent_avatar_url = COALESCE(p_agent_avatar_url, agent_avatar_url),
      price_per_conversation = COALESCE(p_price_per_conversation, price_per_conversation),
      media_url = COALESCE(p_media_url, media_url),
      digital_file_url = COALESCE(p_digital_file_url, digital_file_url),
      blur_preview = COALESCE(p_blur_preview, blur_preview),
      integrations = COALESCE(p_integrations, integrations),
      updated_at = now()
    WHERE id = p_offering_id AND agent_id = p_agent_id;
    
    v_result := jsonb_build_object('id', p_offering_id, 'success', true);
    
  ELSIF p_operation = 'delete' THEN
    DELETE FROM x_agent_offerings 
    WHERE id = p_offering_id AND agent_id = p_agent_id;
    
    v_result := jsonb_build_object('success', true);
  ELSE
    RAISE EXCEPTION 'Invalid operation';
  END IF;

  RETURN v_result;
END;
$$;
