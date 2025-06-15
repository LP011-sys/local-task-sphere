
-- Add missing fields to app_users needed for Profile Settings
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS profile_photo TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

-- (Optional) Add a trigger or set up Supabase Storage bucket for profile images, if you do not have one already.
