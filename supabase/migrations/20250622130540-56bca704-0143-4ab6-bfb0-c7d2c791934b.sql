
-- Add notification tokens and preferences to app_users table
ALTER TABLE public.app_users 
  ADD COLUMN IF NOT EXISTS notification_tokens JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;

-- Create notification_queue table for scheduled notifications
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email', 'push', 'both'
  event_type TEXT NOT NULL, -- 'new_offer', 'task_accepted', 'task_reminder'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notification_queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their notifications
CREATE POLICY "Users can view their notification queue"
  ON public.notification_queue
  FOR SELECT
  USING (user_id = auth.uid());

-- Create function to schedule task reminder notifications
CREATE OR REPLACE FUNCTION schedule_task_reminder(task_id_param UUID)
RETURNS void AS $$
DECLARE
  task_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get task details
  SELECT * INTO task_record 
  FROM "Tasks" 
  WHERE id = task_id_param;
  
  IF task_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate reminder time (1 hour before deadline)
  IF task_record.deadline IS NOT NULL AND task_record.deadline != '' THEN
    BEGIN
      reminder_time := (task_record.deadline::timestamp with time zone) - INTERVAL '1 hour';
      
      -- Only schedule if reminder time is in the future
      IF reminder_time > now() THEN
        INSERT INTO notification_queue (
          user_id,
          type,
          event_type,
          title,
          content,
          data,
          scheduled_for
        ) VALUES (
          task_record.user_id,
          'both',
          'task_reminder',
          'Task Deadline Reminder',
          'Your task "' || COALESCE(task_record.offer, task_record.description) || '" is due in 1 hour!',
          jsonb_build_object('task_id', task_record.id),
          reminder_time
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the operation
      RAISE NOTICE 'Error scheduling reminder for task %: %', task_id_param, SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically schedule reminders when tasks are created
CREATE OR REPLACE FUNCTION trigger_schedule_task_reminder()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM schedule_task_reminder(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new tasks
DROP TRIGGER IF EXISTS schedule_reminder_on_task_insert ON public."Tasks";
CREATE TRIGGER schedule_reminder_on_task_insert
  AFTER INSERT ON public."Tasks"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_schedule_task_reminder();
