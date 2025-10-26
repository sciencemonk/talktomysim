-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to generate daily briefs every hour
-- This will check for advisors scheduled for the current hour and generate their briefs
SELECT cron.schedule(
  'generate-daily-briefs',
  '0 * * * *', -- Run every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-daily-brief',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('time', now())
    ) as request_id;
  $$
);

-- Store the Supabase URL and service role key in settings
-- Note: These will need to be set via Supabase dashboard or environment
DO $$
BEGIN
  -- Create settings if they don't exist
  EXECUTE format('ALTER DATABASE %I SET app.settings.supabase_url = %L', 
    current_database(), 
    current_setting('SUPABASE_URL', true));
  EXECUTE format('ALTER DATABASE %I SET app.settings.service_role_key = %L', 
    current_database(), 
    current_setting('SUPABASE_SERVICE_ROLE_KEY', true));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not set database settings. Please configure manually.';
END $$;