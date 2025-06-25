
-- Add interface_language field to app_users table
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS interface_language TEXT DEFAULT 'en';
