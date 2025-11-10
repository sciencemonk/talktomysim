-- Make user_id nullable in sims table to allow anonymous SIM creation
ALTER TABLE sims 
ALTER COLUMN user_id DROP NOT NULL;