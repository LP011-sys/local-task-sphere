
-- Fix the database defaults that are forcing all users to be customers
-- Remove the hard-coded 'customer' defaults from the migration
ALTER TABLE app_users 
  ALTER COLUMN roles DROP DEFAULT,
  ALTER COLUMN active_role DROP DEFAULT;

-- Update the existing migration to not override user selections
-- This will prevent future users from being forced into customer role
UPDATE app_users 
SET roles = ARRAY['customer']::text[] 
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;

UPDATE app_users 
SET active_role = 'customer' 
WHERE active_role IS NULL;

-- For users who signed up as providers but were incorrectly set to customer,
-- we'll need to identify them based on their signup intent
-- This is a safeguard - you may need to manually correct specific users
-- if you know who should be providers
