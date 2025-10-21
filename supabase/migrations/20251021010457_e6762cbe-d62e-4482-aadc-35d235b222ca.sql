-- Function to generate URL slug from name
CREATE OR REPLACE FUNCTION public.generate_url_slug(input_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(input_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
END;
$$;

-- Function to set custom_url before insert/update if null
CREATE OR REPLACE FUNCTION public.set_custom_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set custom_url if it's null or empty
  IF NEW.custom_url IS NULL OR NEW.custom_url = '' THEN
    NEW.custom_url := public.generate_url_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set custom_url on insert
DROP TRIGGER IF EXISTS set_advisor_custom_url_on_insert ON public.advisors;
CREATE TRIGGER set_advisor_custom_url_on_insert
  BEFORE INSERT ON public.advisors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_custom_url();

-- Create trigger to automatically set custom_url on update if it becomes null
DROP TRIGGER IF EXISTS set_advisor_custom_url_on_update ON public.advisors;
CREATE TRIGGER set_advisor_custom_url_on_update
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW
  WHEN (NEW.custom_url IS NULL OR NEW.custom_url = '')
  EXECUTE FUNCTION public.set_custom_url();