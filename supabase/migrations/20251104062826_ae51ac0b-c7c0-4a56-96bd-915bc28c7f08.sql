-- Add new columns to x_agent_offerings table for digital products
ALTER TABLE x_agent_offerings
ADD COLUMN IF NOT EXISTS offering_type text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS digital_file_url text,
ADD COLUMN IF NOT EXISTS blur_preview boolean DEFAULT false;

-- Add comment to document the offering_type values
COMMENT ON COLUMN x_agent_offerings.offering_type IS 'Type of offering: standard, digital, or agentic_workflow';