
-- Add profile completion columns to app_users table
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS basic_profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_interests TEXT[],
ADD COLUMN IF NOT EXISTS provider_skills TEXT[],
ADD COLUMN IF NOT EXISTS accepts_marketing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verification_url TEXT,
ADD COLUMN IF NOT EXISTS drivers_license_url TEXT,
ADD COLUMN IF NOT EXISTS has_submitted_id BOOLEAN DEFAULT FALSE;

-- Update existing users to have profile_completed = false if not set
UPDATE public.app_users 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL;

-- Update existing users to have basic_profile_completed = false if not set
UPDATE public.app_users 
SET basic_profile_completed = FALSE 
WHERE basic_profile_completed IS NULL;
