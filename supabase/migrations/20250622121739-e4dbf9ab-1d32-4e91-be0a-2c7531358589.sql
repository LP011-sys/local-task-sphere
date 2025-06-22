
-- Create subscription_plans table to store available plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the three subscription plans
INSERT INTO public.subscription_plans (id, name, price_monthly, stripe_price_id, features) VALUES
('starter', 'Starter', 4.99, 'price_starter_monthly', '["2 free boosts per month", "Basic support", "Standard visibility"]'::jsonb),
('pro', 'Pro', 9.99, 'price_pro_monthly', '["5 free boosts per month", "Verified badge", "Priority support", "Enhanced visibility", "Basic analytics"]'::jsonb),
('team', 'Team', 24.99, 'price_team_monthly', '["Unlimited boosts", "Verified badge", "Premium support", "Maximum visibility", "Advanced analytics", "Team collaboration"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  stripe_price_id = EXCLUDED.stripe_price_id,
  features = EXCLUDED.features;

-- Create user_subscriptions table to track user subscription status
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT REFERENCES public.subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')) DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
FOR SELECT TO authenticated
USING (true);

-- RLS policies for user_subscriptions (users can only see their own)
CREATE POLICY "user_subscriptions_select" ON public.user_subscriptions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_insert" ON public.user_subscriptions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_subscriptions_update" ON public.user_subscriptions
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions (status);
