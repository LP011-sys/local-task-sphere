
-- Add boost-related columns to Tasks table
ALTER TABLE public."Tasks" 
ADD COLUMN IF NOT EXISTS is_boosted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS boost_duration integer DEFAULT 0, -- in hours
ADD COLUMN IF NOT EXISTS boost_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS boost_amount numeric(10,2) DEFAULT 0.00;

-- Create index for efficient sorting by boost status
CREATE INDEX IF NOT EXISTS idx_tasks_boost_deadline ON public."Tasks" (is_boosted DESC, deadline ASC);

-- Update existing tasks to have default boost values
UPDATE public."Tasks" 
SET is_boosted = false, boost_duration = 0, boost_amount = 0.00
WHERE is_boosted IS NULL OR boost_duration IS NULL OR boost_amount IS NULL;
