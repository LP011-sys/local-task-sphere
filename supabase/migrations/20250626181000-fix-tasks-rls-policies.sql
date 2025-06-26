
-- Update Tasks RLS policies to work correctly with app_users relationship
DROP POLICY IF EXISTS "Customers can create their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can view their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Providers see open tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can update their own tasks" ON public."Tasks";

-- Recreate policies using the helper function
CREATE POLICY "Customers can create their own tasks"
  ON public."Tasks"
  FOR INSERT
  WITH CHECK (
    user_id = public.get_current_app_user_id()
    OR (
      -- Fallback: if no app_users record exists yet, allow if auth user exists
      auth.uid() IS NOT NULL 
      AND user_id IN (
        SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can view their own tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    user_id = public.get_current_app_user_id()
    OR (
      -- Fallback: allow viewing if this task belongs to current auth user
      user_id IN (
        SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Providers see open tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    status = 'open'
    AND EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE auth_user_id = auth.uid() 
      AND 'provider' = ANY(roles)
    )
  );

CREATE POLICY "Customers can update their own tasks"
  ON public."Tasks"
  FOR UPDATE
  USING (
    user_id = public.get_current_app_user_id()
    OR (
      user_id IN (
        SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
      )
    )
  );
