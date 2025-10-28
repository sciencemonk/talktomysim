-- Add new sim_category constraint value for PumpFun Agent
-- Include all existing categories plus the new PumpFun Agent type
ALTER TABLE advisors DROP CONSTRAINT IF EXISTS advisors_sim_category_check;

ALTER TABLE advisors ADD CONSTRAINT advisors_sim_category_check 
CHECK (sim_category IN (
  'Chat',
  'Autonomous Agent',
  'PumpFun Agent',
  'Daily Brief',
  'Crypto Mail'
));