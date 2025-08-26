-- We'll keep the owner_welcome_message column for backward compatibility
-- but it will no longer be used in the application.
-- This ensures we don't break existing data or cause errors.
-- The application will now generate dynamic welcome messages for owners.

-- Add a comment to the column to indicate it's deprecated
COMMENT ON COLUMN advisors.owner_welcome_message IS 'DEPRECATED: This field is no longer used. The application now generates dynamic welcome messages for owners.';
