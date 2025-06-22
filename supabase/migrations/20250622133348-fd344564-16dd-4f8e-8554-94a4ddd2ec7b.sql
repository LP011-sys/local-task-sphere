
-- Step 1: Insert your admin profile into app_users table
INSERT INTO public.app_users (
  auth_user_id,
  role,
  name,
  email,
  preferred_language,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'luka.papic.fb@gmail.com'),
  'admin',
  'Luka Papic',
  'luka.papic.fb@gmail.com',
  'en',
  now(),
  now()
) ON CONFLICT (auth_user_id) DO UPDATE SET
  role = 'admin',
  name = 'Luka Papic',
  updated_at = now();

-- Step 2: Insert admin role into user_roles table
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'luka.papic.fb@gmail.com'),
  'admin',
  now()
) ON CONFLICT (user_id, role) DO NOTHING;
