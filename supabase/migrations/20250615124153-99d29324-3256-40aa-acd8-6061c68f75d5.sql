
-- 1. Insert demo customers and providers with valid UUIDs
insert into app_users (id, auth_user_id, role, name, email, created_at, subscription_plan)
values
  ('11111111-1111-1111-1111-11111111c001', '11111111-1111-1111-1111-11111111c001', 'customer', 'Alice Customer', 'alice.customer@demo.com', now() - interval '90 days', 'free'),
  ('11111111-1111-1111-1111-11111111c002', '11111111-1111-1111-1111-11111111c002', 'customer', 'Bob Client', 'bob.client@demo.com', now() - interval '60 days', 'premium'),
  ('11111111-1111-1111-1111-11111111a001', '11111111-1111-1111-1111-11111111a001', 'provider', 'Anna Provider', 'anna.provider@demo.com', now() - interval '80 days', 'free'),
  ('11111111-1111-1111-1111-11111111a002', '11111111-1111-1111-1111-11111111a002', 'provider', 'Tom Fixer', 'tom.fixer@demo.com', now() - interval '55 days', 'free');

-- 2. Insert demo tasks (some open, some completed)
insert into "Tasks" (id, user_id, category, description, type, status, created_at, deadline, price)
values
  ('22222222-2222-2222-2222-22222222a001', '11111111-1111-1111-1111-11111111c001', 'Cleaning', 'Clean my kitchen and living room', 'once', 'open', now() - interval '8 days', now() + interval '1 day', '40'),
  ('22222222-2222-2222-2222-22222222a002', '11111111-1111-1111-1111-11111111c002', 'Assembly', 'Build IKEA bookshelf', 'once', 'completed', now() - interval '30 days', now() - interval '28 days', '90'),
  ('22222222-2222-2222-2222-22222222a003', '11111111-1111-1111-1111-11111111c002', 'Handyman', 'Fix leaky sink', 'once', 'done', now() - interval '15 days', now() - interval '13 days', '60'),
  ('22222222-2222-2222-2222-22222222a004', '11111111-1111-1111-1111-11111111c001', 'Moving', 'Help move boxes', 'once', 'open', now() - interval '1 day', now() + interval '2 days', '70');

-- 3. Insert demo payments (transactions)
insert into payments (id, task_id, customer_id, provider_id, amount_total, amount_platform_fee, amount_provider, status, created_at)
values
  ('33333333-3333-3333-3333-33333333b001', '22222222-2222-2222-2222-22222222a002', '11111111-1111-1111-1111-11111111c002', '11111111-1111-1111-1111-11111111a001', 90, 18, 72, 'released', now() - interval '27 days'),
  ('33333333-3333-3333-3333-33333333b002', '22222222-2222-2222-2222-22222222a003', '11111111-1111-1111-1111-11111111c002', '11111111-1111-1111-1111-11111111a002', 60, 12, 48, 'paid', now() - interval '12 days');

-- 4. Insert demo offer for an open task
insert into offers (id, task_id, provider_id, message, price, created_at, status)
values
  ('44444444-4444-4444-4444-44444444d001', '22222222-2222-2222-2222-22222222a001', '11111111-1111-1111-1111-11111111a002', 'I can clean today!', '40', now() - interval '3 hours', 'pending');

-- 5. Insert demo review for a completed task
insert into reviews (id, task_id, reviewer_id, reviewed_user_id, rating, comment, created_at)
values
  ('55555555-5555-5555-5555-55555555e001', '22222222-2222-2222-2222-22222222a002', '11111111-1111-1111-1111-11111111c002', '11111111-1111-1111-1111-11111111a001', 5, 'Anna did a fantastic job!', now() - interval '28 days');

-- 6. Insert demo favorite (customer favorites provider)
insert into favorites (id, customer_id, provider_id, created_at)
values
  ('66666666-6666-6666-6666-66666666f001', '11111111-1111-1111-1111-11111111c001', '11111111-1111-1111-1111-11111111a001', now() - interval '1 day');
