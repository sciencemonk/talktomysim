-- Fix search_path for generate_url_slug function
CREATE OR REPLACE FUNCTION public.generate_url_slug(input_name text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(input_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
END;
$$;

-- Fix search_path for set_custom_url function
CREATE OR REPLACE FUNCTION public.set_custom_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only set custom_url if it's null or empty
  IF NEW.custom_url IS NULL OR NEW.custom_url = '' THEN
    NEW.custom_url := public.generate_url_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;