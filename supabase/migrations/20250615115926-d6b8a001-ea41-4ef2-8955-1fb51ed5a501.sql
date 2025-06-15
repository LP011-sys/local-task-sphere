
-- Add 'status' field to Tasks table to support task lifecycle
ALTER TABLE public."Tasks"
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'open' CHECK (status IN ('open','in_progress','done','completed','cancelled'));

-- Optionally, (future) add status_changed_at column
-- ALTER TABLE public."Tasks"
--   ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
