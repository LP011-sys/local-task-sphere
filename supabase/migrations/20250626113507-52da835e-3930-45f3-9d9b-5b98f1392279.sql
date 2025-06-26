
-- Fix authentication issues: Add RLS policies and ensure proper schema
-- This migration addresses the core database issues preventing authentication

-- First, ensure the app_users table has proper RLS policies
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.app_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_users;

-- Create RLS policies to allow users to manage their own profiles
CREATE POLICY "Users can read own profile"
  ON public.app_users
  FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.app_users
  FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.app_users
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Ensure the roles column exists and has proper constraints
ALTER TABLE public.app_users 
  ALTER COLUMN roles SET DEFAULT ARRAY['customer']::text[],
  ALTER COLUMN active_role SET DEFAULT 'customer';

-- Update any existing records that might have null values
UPDATE public.app_users 
SET roles = ARRAY['customer']::text[] 
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;

UPDATE public.app_users 
SET active_role = 'customer' 
WHERE active_role IS NULL;

-- Create a function to safely get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(user_id UUID, user_email TEXT, user_name TEXT DEFAULT '', user_roles TEXT[] DEFAULT ARRAY['customer']::TEXT[], user_active_role TEXT DEFAULT 'customer')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Try to get existing profile
  SELECT id INTO profile_id 
  FROM public.app_users 
  WHERE auth_user_id = user_id;
  
  -- If no profile exists, create one
  IF profile_id IS NULL THEN
    INSERT INTO public.app_users (
      auth_user_id,
      email,
      name,
      roles,
      active_role,
      role
    ) VALUES (
      user_id,
      user_email,
      user_name,
      user_roles,
      user_active_role,
      user_active_role
    ) RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile TO authenticated;
