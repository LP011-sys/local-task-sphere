
import { supabase } from "@/integrations/supabase/client";

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Start the scheduler to process notifications every 5 minutes
  start() {
    if (this.intervalId) return; // Already running

    this.intervalId = setInterval(async () => {
      try {
        await this.processNotifications();
      } catch (error) {
        console.error('Error in notification scheduler:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('Notification scheduler started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Notification scheduler stopped');
    }
  }

  private async processNotifications() {
    try {
      const { data, error } = await supabase.functions.invoke('process-notifications');
      
      if (error) {
        console.error('Failed to process notifications:', error);
        return;
      }

      if (data?.processed > 0) {
        console.log(`Processed ${data.processed} notifications`);
      }
    } catch (error) {
      console.error('Error calling process-notifications function:', error);
    }
  }

  // Manual trigger for immediate processing
  async triggerProcessing() {
    await this.processNotifications();
  }
}

// Auto-start the scheduler when the module is imported
// You might want to move this to your main App component
if (typeof window !== 'undefined') {
  const scheduler = NotificationScheduler.getInstance();
  scheduler.start();
}
