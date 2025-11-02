-- Function to manage offerings with edit code
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
  p_operation text DEFAULT 'insert' -- 'insert', 'update', or 'delete'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_offering_id uuid;
BEGIN
  -- Validate edit code
  IF NOT EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = p_agent_id 
    AND edit_code = p_edit_code
  ) THEN
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