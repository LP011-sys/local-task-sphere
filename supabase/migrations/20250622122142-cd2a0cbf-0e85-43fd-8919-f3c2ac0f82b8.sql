
-- Add referral and credit fields to app_users table
ALTER TABLE public.app_users 
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.app_users(id);

-- Create referrals table to track referral relationships and credit awards
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  credit_awarded BOOLEAN DEFAULT false,
  credit_awarded_at TIMESTAMPTZ,
  first_task_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Create credits_history table to track all credit transactions
CREATE TABLE IF NOT EXISTS public.credits_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('referral_bonus', 'referral_reward', 'task_payment', 'bonus')) NOT NULL,
  description TEXT,
  referral_id UUID REFERENCES public.referrals(id),
  task_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "referrals_select" ON public.referrals
FOR SELECT TO authenticated
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "referrals_insert" ON public.referrals
FOR INSERT TO authenticated
WITH CHECK (referred_id = auth.uid());

-- RLS policies for credits_history
CREATE POLICY "credits_history_select" ON public.credits_history
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "credits_history_insert" ON public.credits_history
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_users_referral_code ON public.app_users (referral_code);
CREATE INDEX IF NOT EXISTS idx_app_users_referred_by ON public.app_users (referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals (referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_credits_history_user ON public.credits_history (user_id);
CREATE INDEX IF NOT EXISTS idx_credits_history_type ON public.credits_history (type);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code with letters and numbers
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.app_users WHERE referral_code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to award referral credits (fixed)
CREATE OR REPLACE FUNCTION award_referral_credits(referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  referral_id UUID;
  referrer_id UUID;
BEGIN
  -- Get the referral record
  SELECT r.id, r.referrer_id INTO referral_id, referrer_id
  FROM public.referrals r
  WHERE r.referred_id = referred_user_id 
    AND r.credit_awarded = false;
  
  -- If referral exists and credit not yet awarded
  IF FOUND THEN
    -- Update credit balances
    UPDATE public.app_users 
    SET credit_balance = credit_balance + 5.00
    WHERE id = referrer_id OR id = referred_user_id;
    
    -- Mark referral as credited
    UPDATE public.referrals
    SET credit_awarded = true, 
        credit_awarded_at = now(),
        first_task_completed_at = now()
    WHERE id = referral_id;
    
    -- Add credit history records
    INSERT INTO public.credits_history (user_id, amount, type, description, referral_id)
    VALUES 
      (referrer_id, 5.00, 'referral_bonus', 'Referral bonus for bringing new user', referral_id),
      (referred_user_id, 5.00, 'referral_reward', 'Welcome bonus for joining via referral', referral_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate referral code on user creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS trigger_set_referral_code ON public.app_users;
CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();
