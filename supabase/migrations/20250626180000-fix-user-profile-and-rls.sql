
-- Create function to get app_users.id from auth.uid() safely
CREATE OR REPLACE FUNCTION public.get_current_app_user_id()
RETURNS UUID AS $$
DECLARE
  app_user_id UUID;
BEGIN
  SELECT id INTO app_user_id 
  FROM public.app_users 
  WHERE auth_user_id = auth.uid();
  
  RETURN app_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to ensure app_users record exists
CREATE OR REPLACE FUNCTION public.ensure_app_user_profile()
RETURNS UUID AS $$
DECLARE
  user_record RECORD;
  app_user_id UUID;
BEGIN
  -- Get current auth user
  SELECT * INTO user_record FROM auth.users WHERE id = auth.uid();
  
  IF user_record IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if app_users record exists
  SELECT id INTO app_user_id 
  FROM public.app_users 
  WHERE auth_user_id = user_record.id;
  
  -- If no record exists, create one
  IF app_user_id IS NULL THEN
    INSERT INTO public.app_users (
      auth_user_id,
      role,
      name,
      email,
      preferred_language,
      roles,
      active_role
    ) VALUES (
      user_record.id,
      'customer',
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email),
      user_record.email,
      'en',
      ARRAY['customer']::text[],
      'customer'
    ) RETURNING id INTO app_user_id;
  END IF;
  
  RETURN app_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Tasks RLS policies to use the new function
DROP POLICY IF EXISTS "Customers can create their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can view their own tasks" ON public."Tasks";

CREATE POLICY "Customers can create their own tasks"
  ON public."Tasks"
  FOR INSERT
  WITH CHECK (
    user_id = public.get_current_app_user_id()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Customers can view their own tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    user_id = public.get_current_app_user_id()
    AND public.has_role(auth.uid(), 'customer')
  );
