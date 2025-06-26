
-- Fix Tasks RLS policies to work with app_users.id foreign key relationship
DROP POLICY IF EXISTS "Customers can create their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can view their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Providers see open tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can update their own tasks" ON public."Tasks";

-- Create simplified policies that work with app_users relationship
CREATE POLICY "Customers can create their own tasks"
  ON public."Tasks"
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
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
    user_id IN (
      SELECT id FROM public.app_users WHERE auth_user_id = auth.uid()
    )
  );
