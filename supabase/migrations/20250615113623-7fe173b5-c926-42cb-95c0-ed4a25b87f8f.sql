
-- Create offers table for provider offers on tasks
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  message text,
  price text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' -- could be: pending, accepted, rejected
);

-- Enable RLS for basic access control
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated customers to view offers for their own tasks
CREATE POLICY "Customers can view offers for their own tasks"
  ON public.offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Tasks"
      WHERE "Tasks".id = offers.task_id
        AND "Tasks".user_id = auth.uid()
    )
  );

-- Allow providers to create offers on any open tasks
CREATE POLICY "Providers can create offers"
  ON public.offers
  FOR INSERT
  WITH CHECK (provider_id = auth.uid());

-- Allow the owner (customer) of the task to update the offer status (accept/reject)
CREATE POLICY "Customers can update offer status"
  ON public.offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Tasks"
      WHERE "Tasks".id = offers.task_id
        AND "Tasks".user_id = auth.uid()
    )
  );

-- Allow providers to view their own offers (separate SELECT and UPDATE)
CREATE POLICY "Providers can view their own offers"
  ON public.offers
  FOR SELECT
  USING (provider_id = auth.uid());

-- Allow providers to update their own offers
CREATE POLICY "Providers can update their own offers"
  ON public.offers
  FOR UPDATE
  USING (provider_id = auth.uid());
