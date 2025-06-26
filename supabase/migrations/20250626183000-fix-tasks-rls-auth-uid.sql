
-- Drop conflicting RLS policy if exists
DROP POLICY IF EXISTS "Allow insert for matching user" ON public."Tasks";

-- Create secure RLS insert policy using auth.uid()
CREATE POLICY "Allow task insert if user_id matches session user"
ON public."Tasks"
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Make sure RLS is enabled
ALTER TABLE public."Tasks" ENABLE ROW LEVEL SECURITY;
