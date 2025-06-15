
-- 1. Create an enum for user roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('customer', 'provider', 'admin');
  END IF;
END$$;

-- 2. Create the user_roles table if not exists (no recursive FKs with auth.users!)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- (Optional) Simple RLS for now; can be customized further:
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow admins to see/assign any roles, regular users can see only own roles
CREATE POLICY "Admins can see all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create/assign own role" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add the function to conveniently check for admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Example: (Note: implement app RLS policies for other tables later as needed)
