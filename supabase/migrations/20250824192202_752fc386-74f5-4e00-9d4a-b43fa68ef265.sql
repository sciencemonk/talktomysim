-- The handle_new_user function legitimately needs SECURITY DEFINER 
-- to insert into profiles when users sign up through Supabase Auth.
-- However, we can improve its security by being more explicit about permissions.

-- First, let's create a more secure version that minimizes the security definer scope
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_metadata jsonb;
BEGIN
  -- Extract metadata safely
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Insert with explicit schema qualification and error handling
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
    COALESCE(user_metadata->>'username', 'User'),
    COALESCE(user_metadata->>'passcode', '0000'),
    user_metadata->>'parent_first_name',
    user_metadata->>'parent_last_name',
    user_metadata->>'parent_email',
    user_metadata->>'student_first_name',
    user_metadata->>'student_last_name'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Add a comment explaining why SECURITY DEFINER is necessary
COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER required: This function runs in auth.users context to create user profiles. Without SECURITY DEFINER, it cannot insert into profiles table during user registration.';

-- Ensure the function has minimal permissions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Alternative approach: Create a view-based solution if possible
-- But for auth triggers, SECURITY DEFINER is the standard and necessary pattern