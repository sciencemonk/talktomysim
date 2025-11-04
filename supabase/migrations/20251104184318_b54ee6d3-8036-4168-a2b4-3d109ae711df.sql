-- Convert verification_status from text to boolean
-- Step 1: Add a temporary boolean column
ALTER TABLE advisors ADD COLUMN verification_status_new boolean;

-- Step 2: Migrate existing data
-- 'approved' or 'verified' -> true, 'pending' or anything else -> false
UPDATE advisors 
SET verification_status_new = CASE 
  WHEN verification_status IN ('approved', 'verified') THEN true
  ELSE false
END;

-- Step 3: Drop old column
ALTER TABLE advisors DROP COLUMN verification_status;

-- Step 4: Rename new column to original name
ALTER TABLE advisors RENAME COLUMN verification_status_new TO verification_status;

-- Step 5: Set default value and not null constraint
ALTER TABLE advisors ALTER COLUMN verification_status SET DEFAULT false;
ALTER TABLE advisors ALTER COLUMN verification_status SET NOT NULL;