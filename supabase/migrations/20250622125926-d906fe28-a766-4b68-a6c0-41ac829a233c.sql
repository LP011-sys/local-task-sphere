
-- Add loyalty tier tracking to app_users table
ALTER TABLE public.app_users 
  ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'Bronze';

-- Create function to update loyalty tier based on completed tasks
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update loyalty tier based on tasks completed
  IF NEW.tasks_completed >= 15 THEN
    NEW.loyalty_tier = 'Gold';
  ELSIF NEW.tasks_completed >= 5 THEN
    NEW.loyalty_tier = 'Silver';
  ELSE
    NEW.loyalty_tier = 'Bronze';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update loyalty tier when tasks_completed changes
DROP TRIGGER IF EXISTS loyalty_tier_update_trigger ON public.app_users;
CREATE TRIGGER loyalty_tier_update_trigger
  BEFORE UPDATE OF tasks_completed ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- Create function to increment completed tasks for a user
CREATE OR REPLACE FUNCTION increment_user_completed_tasks(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.app_users 
  SET tasks_completed = tasks_completed + 1,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
