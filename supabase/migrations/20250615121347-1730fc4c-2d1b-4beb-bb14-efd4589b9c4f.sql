
-- 1. Create favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (customer_id, provider_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 3. Only the customer can insert and view their own favorites
CREATE POLICY "Customers can insert their own favorites" ON public.favorites
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can view their own favorites" ON public.favorites
  FOR SELECT
  USING (customer_id = auth.uid());

-- 4. Customers can delete (unfavorite) their own favorites
CREATE POLICY "Customers can delete their own favorites" ON public.favorites
  FOR DELETE
  USING (customer_id = auth.uid());

-- 5. Do not create an UPDATE policy (favorites cannot be updated, just created/deleted)

