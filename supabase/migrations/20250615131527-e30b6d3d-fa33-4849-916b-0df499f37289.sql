
-- Remove existing policies if they exist, then (re-)create all required policies

-- 1. TASKS Table
DROP POLICY IF EXISTS "Customers can create their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can view their own tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Providers see open tasks" ON public."Tasks";
DROP POLICY IF EXISTS "Customers can update their own tasks" ON public."Tasks";

ALTER TABLE public."Tasks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can create their own tasks"
  ON public."Tasks"
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Customers can view their own tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Providers see open tasks"
  ON public."Tasks"
  FOR SELECT
  USING (
    status = 'open'
    AND public.has_role(auth.uid(), 'provider')
  );

CREATE POLICY "Customers can update their own tasks"
  ON public."Tasks"
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

-- 2. OFFERS Table
DROP POLICY IF EXISTS "Providers can make offers" ON public.offers;
DROP POLICY IF EXISTS "Customers can view offers on their tasks" ON public.offers;
DROP POLICY IF EXISTS "Providers can view their own offers" ON public.offers;
DROP POLICY IF EXISTS "Customers can update offer status" ON public.offers;
DROP POLICY IF EXISTS "Providers can update their own pending offers" ON public.offers;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can make offers"
  ON public.offers
  FOR INSERT
  WITH CHECK (
    provider_id = auth.uid()
    AND public.has_role(auth.uid(), 'provider')
  );

CREATE POLICY "Customers can view offers on their tasks"
  ON public.offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Tasks"
      WHERE "Tasks".id = offers.task_id
        AND "Tasks".user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Providers can view their own offers"
  ON public.offers
  FOR SELECT
  USING (
    provider_id = auth.uid()
    AND public.has_role(auth.uid(), 'provider')
  );

CREATE POLICY "Customers can update offer status"
  ON public.offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Tasks"
      WHERE "Tasks".id = offers.task_id
        AND "Tasks".user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Providers can update their own pending offers"
  ON public.offers
  FOR UPDATE
  USING (
    provider_id = auth.uid()
    AND status = 'pending'
    AND public.has_role(auth.uid(), 'provider')
  );

-- 3. MESSAGES Table
DROP POLICY IF EXISTS "Sender/receiver can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Sender can insert messages" ON public.messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender/receiver can view their messages"
  ON public.messages
  FOR SELECT
  USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
  );

CREATE POLICY "Sender can insert messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

-- 4. PAYMENTS Table
DROP POLICY IF EXISTS "Customers can make payments" ON public.payments;
DROP POLICY IF EXISTS "Task users can view task payments" ON public.payments;
DROP POLICY IF EXISTS "Customer can update payment" ON public.payments;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can make payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Task users can view task payments"
  ON public.payments
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR provider_id = auth.uid()
  );

CREATE POLICY "Customer can update payment"
  ON public.payments
  FOR UPDATE
  USING (
    customer_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

-- 5. NOTIFICATIONS Table
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert notifications for themselves"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );

-- 6. REVIEWS Table
DROP POLICY IF EXISTS "Reviewer can leave review" ON public.reviews;
DROP POLICY IF EXISTS "Reviewer/reviewed can see reviews" ON public.reviews;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewer can leave review"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
  );

CREATE POLICY "Reviewer/reviewed can see reviews"
  ON public.reviews
  FOR SELECT
  USING (
    reviewer_id = auth.uid()
    OR reviewed_user_id = auth.uid()
  );

-- 7. FAVORITES Table
DROP POLICY IF EXISTS "Customers can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Customers can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Customers can delete their own favorites" ON public.favorites;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Customers can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (
    customer_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );

CREATE POLICY "Customers can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (
    customer_id = auth.uid()
    AND public.has_role(auth.uid(), 'customer')
  );
