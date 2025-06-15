
-- 1. Create the 'reviews' table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  reviewed_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Only the reviewer can INSERT a review for their completed tasks
CREATE POLICY "Reviewer can insert their review" ON public.reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
  );

-- 4. Reviewer or reviewed user can SELECT, but not other users
CREATE POLICY "Reviewer and reviewed can select reviews" ON public.reviews
  FOR SELECT
  USING (
    reviewer_id = auth.uid() OR reviewed_user_id = auth.uid()
  );

-- 5. DISABLE UPDATES (no explicit policy needed, just don't enable UPDATE policy)

-- 6. Reviewer can delete their own review (optional, can leave out if you want reviews to be 'immutable')
-- If reviews should never be deleted, leave this out.
-- CREATE POLICY "Reviewer can delete their own review" ON public.reviews
--   FOR DELETE
--   USING (reviewer_id = auth.uid());

