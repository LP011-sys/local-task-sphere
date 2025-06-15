
-- 1. Create the "payments" table for Fiverr-style escrow/payment
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  amount_total numeric NOT NULL,
  amount_platform_fee numeric NOT NULL,
  amount_provider numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'released')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable RLS for "payments"
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Customers and Providers can SELECT payment records for their tasks
CREATE POLICY "Customers and Providers can view payments for their tasks"
  ON public.payments
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR provider_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM "Tasks"
      WHERE "Tasks".id = payments.task_id
        AND "Tasks".user_id = auth.uid()
    )
  );

-- 4. Customers can INSERT (make payment intention/upfront payment)
CREATE POLICY "Customers can insert payment records"
  ON public.payments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- 5. Providers can view payment status for their work
CREATE POLICY "Providers can view their payment status"
  ON public.payments
  FOR SELECT
  USING (provider_id = auth.uid());

-- 6. Only customer can update their payment record (pay or confirm release)
CREATE POLICY "Customer can update own payment status"
  ON public.payments
  FOR UPDATE
  USING (customer_id = auth.uid());
