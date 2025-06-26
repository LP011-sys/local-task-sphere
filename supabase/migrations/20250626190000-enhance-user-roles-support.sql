
-- Ensure roles column exists and has proper default
ALTER TABLE app_users 
  ALTER COLUMN roles SET DEFAULT ARRAY['customer']::text[],
  ALTER COLUMN active_role SET DEFAULT 'customer';

-- Update existing users who might not have roles array set
UPDATE app_users 
SET roles = ARRAY['customer']::text[] 
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;

-- Update existing users who might not have active_role set
UPDATE app_users 
SET active_role = 'customer' 
WHERE active_role IS NULL;

-- Add index for better performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_app_users_roles ON app_users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_app_users_active_role ON app_users (active_role);
