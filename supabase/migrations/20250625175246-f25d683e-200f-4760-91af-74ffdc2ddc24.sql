
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['customer']::text[],
  ADD COLUMN IF NOT EXISTS active_role text DEFAULT 'customer';
