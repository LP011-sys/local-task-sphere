
-- Create the Tasks table for storing posted tasks
CREATE TABLE public."Tasks" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  images jsonb,
  location jsonb,
  type text NOT NULL,
  price text,
  offer text,
  deadline text,
  acceptance_deadline text,
  recurring boolean DEFAULT false,
  boost_status text,
  suggested_price text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."Tasks" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert/view their own tasks only
CREATE POLICY "Users can insert their own tasks"
  ON public."Tasks"
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can select their own tasks"
  ON public."Tasks"
  FOR SELECT
  USING (user_id = auth.uid());
