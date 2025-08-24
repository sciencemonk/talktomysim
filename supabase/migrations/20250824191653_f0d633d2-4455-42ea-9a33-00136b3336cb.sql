-- Fix security definer issues by adding proper search_path to functions

-- Update the handle_new_user function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    passcode,
    parent_first_name,
    parent_last_name,
    parent_email,
    student_first_name,
    student_last_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'passcode', '0000'),
    NEW.raw_user_meta_data->>'parent_first_name',
    NEW.raw_user_meta_data->>'parent_last_name',
    NEW.raw_user_meta_data->>'parent_email',
    NEW.raw_user_meta_data->>'student_first_name',
    NEW.raw_user_meta_data->>'student_last_name'
  );
  RETURN NEW;
END;
$$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_escalation_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;