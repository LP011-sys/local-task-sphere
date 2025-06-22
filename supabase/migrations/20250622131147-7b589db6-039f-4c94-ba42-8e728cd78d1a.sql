
-- Create analytics_snapshots table to store weekly metrics
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  mau INTEGER NOT NULL DEFAULT 0,
  tasks_posted INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  boost_purchases INTEGER NOT NULL DEFAULT 0,
  subscription_count INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Only admins can access analytics"
  ON public.analytics_snapshots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate and store weekly analytics
CREATE OR REPLACE FUNCTION calculate_weekly_analytics()
RETURNS void AS $$
DECLARE
  current_week_start DATE;
  current_week_end DATE;
  mau_count INTEGER;
  tasks_posted_count INTEGER;
  tasks_completed_count INTEGER;
  boost_purchases_count INTEGER;
  subscription_count_current INTEGER;
  total_revenue_amount DECIMAL(10,2);
BEGIN
  -- Calculate current week dates (Monday to Sunday)
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  current_week_end := (current_week_start + INTERVAL '6 days')::date;
  
  -- Calculate MAU (Monthly Active Users)
  SELECT COUNT(DISTINCT user_id) INTO mau_count
  FROM (
    -- Users who posted tasks
    SELECT user_id FROM "Tasks" 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION
    
    -- Users who made offers
    SELECT user_id FROM "Offers"
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION
    
    -- Users with payments
    SELECT user_id FROM payments
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  ) active_users;
  
  -- Tasks posted this week
  SELECT COUNT(*) INTO tasks_posted_count
  FROM "Tasks"
  WHERE created_at >= current_week_start 
    AND created_at < current_week_end + INTERVAL '1 day';
  
  -- Tasks completed this week
  SELECT COUNT(*) INTO tasks_completed_count
  FROM "Tasks"
  WHERE status = 'completed'
    AND updated_at >= current_week_start 
    AND updated_at < current_week_end + INTERVAL '1 day';
  
  -- Boost purchases this week
  SELECT COUNT(*) INTO boost_purchases_count
  FROM payments
  WHERE type = 'boost'
    AND status = 'completed'
    AND created_at >= current_week_start 
    AND created_at < current_week_end + INTERVAL '1 day';
  
  -- Current active subscriptions
  SELECT COUNT(*) INTO subscription_count_current
  FROM subscriptions
  WHERE status = 'active';
  
  -- Total revenue this week
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue_amount
  FROM payments
  WHERE status = 'completed'
    AND created_at >= current_week_start 
    AND created_at < current_week_end + INTERVAL '1 day';
  
  -- Insert or update the snapshot
  INSERT INTO analytics_snapshots (
    snapshot_date,
    week_start,
    week_end,
    mau,
    tasks_posted,
    tasks_completed,
    boost_purchases,
    subscription_count,
    total_revenue
  ) VALUES (
    CURRENT_DATE,
    current_week_start,
    current_week_end,
    mau_count,
    tasks_posted_count,
    tasks_completed_count,
    boost_purchases_count,
    subscription_count_current,
    total_revenue_amount
  )
  ON CONFLICT (snapshot_date) 
  DO UPDATE SET
    mau = EXCLUDED.mau,
    tasks_posted = EXCLUDED.tasks_posted,
    tasks_completed = EXCLUDED.tasks_completed,
    boost_purchases = EXCLUDED.boost_purchases,
    subscription_count = EXCLUDED.subscription_count,
    total_revenue = EXCLUDED.total_revenue,
    created_at = now();
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for real-time analytics (current week)
CREATE OR REPLACE FUNCTION get_current_analytics()
RETURNS TABLE(
  mau INTEGER,
  tasks_posted INTEGER,
  tasks_completed INTEGER,
  boost_purchases INTEGER,
  subscription_count INTEGER,
  total_revenue DECIMAL(10,2)
) AS $$
DECLARE
  current_week_start DATE;
  current_week_end DATE;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::date;
  current_week_end := (current_week_start + INTERVAL '6 days')::date;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT user_id)::INTEGER
     FROM (
       SELECT user_id FROM "Tasks" WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       UNION
       SELECT user_id FROM "Offers" WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       UNION
       SELECT user_id FROM payments WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
     ) active_users) as mau,
    
    (SELECT COUNT(*)::INTEGER FROM "Tasks" 
     WHERE created_at >= current_week_start 
       AND created_at < current_week_end + INTERVAL '1 day') as tasks_posted,
    
    (SELECT COUNT(*)::INTEGER FROM "Tasks" 
     WHERE status = 'completed'
       AND updated_at >= current_week_start 
       AND updated_at < current_week_end + INTERVAL '1 day') as tasks_completed,
    
    (SELECT COUNT(*)::INTEGER FROM payments 
     WHERE type = 'boost' AND status = 'completed'
       AND created_at >= current_week_start 
       AND created_at < current_week_end + INTERVAL '1 day') as boost_purchases,
    
    (SELECT COUNT(*)::INTEGER FROM subscriptions WHERE status = 'active') as subscription_count,
    
    (SELECT COALESCE(SUM(amount), 0) FROM payments 
     WHERE status = 'completed'
       AND created_at >= current_week_start 
       AND created_at < current_week_end + INTERVAL '1 day') as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
