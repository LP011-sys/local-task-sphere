
-- Add verification column to app_users table
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create index for efficient querying of verified providers
CREATE INDEX IF NOT EXISTS idx_app_users_verified ON public.app_users (is_verified);

-- Update existing users to have default verification status
UPDATE public.app_users 
SET is_verified = false
WHERE is_verified IS NULL;
