-- Step 1: Drop the existing constraint first
ALTER TABLE advisors 
DROP CONSTRAINT IF EXISTS advisors_sim_category_check;

-- Step 2: Now update all Contact Me records to Crypto Mail
UPDATE advisors 
SET sim_category = 'Crypto Mail' 
WHERE sim_category = 'Contact Me';

-- Step 3: Add new check constraint with updated values
ALTER TABLE advisors 
ADD CONSTRAINT advisors_sim_category_check 
CHECK (sim_category IN ('Chat', 'Crypto Mail', 'Autonomous Agent'));