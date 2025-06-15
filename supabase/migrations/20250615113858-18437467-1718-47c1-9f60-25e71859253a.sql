
-- 1. Create the "messages" table for task-based 1-on-1 chat
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable RLS for access control
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to see messages for tasks they are involved in (as sender or receiver)
CREATE POLICY "Users can view messages for tasks they are involved in"
  ON public.messages
  FOR SELECT
  USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
    OR EXISTS (
         SELECT 1 FROM "Tasks"
         WHERE "Tasks".id = messages.task_id
           AND "Tasks".user_id = auth.uid()
       )
  );

-- 4. Allow users to send messages (insert) if they are either the sender or receiver and are involved with the task
CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND EXISTS (
         SELECT 1 FROM "Tasks"
         WHERE "Tasks".id = messages.task_id
           AND (
             "Tasks".user_id = auth.uid()
             OR messages.sender_id = auth.uid()
             OR messages.receiver_id = auth.uid()
           )
       )
  );
