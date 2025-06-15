
-- 1. Create the user_role enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'provider', 'admin');
  END IF;
END
$$;

-- 2. Create the app_users table (drop if partially created before)
DROP TABLE IF EXISTS public.app_users CASCADE;

CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL, -- reference to supabase auth.users
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  location GEOGRAPHY,
  verification_status TEXT DEFAULT 'unverified',
  rating NUMERIC(2,1) DEFAULT 0.0,
  completed_tasks INT DEFAULT 0,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
