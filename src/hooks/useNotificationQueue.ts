
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook to queue notifications
export function useQueueNotification() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      userId,
      type,
      eventType,
      title,
      content,
      data = {},
      scheduledFor = new Date()
    }: {
      userId: string;
      type: 'email' | 'push' | 'both';
      eventType: 'new_offer' | 'task_accepted' | 'task_reminder';
      title: string;
      content: string;
      data?: any;
      scheduledFor?: Date;
    }) => {
      const { error } = await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          type,
          event_type: eventType,
          title,
          content,
          data,
          scheduled_for: scheduledFor.toISOString()
        });

      if (error) throw error;
    },
    onError: (error: any) => {
      console.error("Failed to queue notification:", error);
      toast({
        title: "Error",
        description: "Failed to queue notification.",
        variant: "destructive",
      });
    },
  });
}

// Hook to update notification tokens
export function useUpdateNotificationTokens() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, tokens }: { userId: string; tokens: string[] }) => {
      const { error } = await supabase
        .from('app_users')
        .update({ notification_tokens: tokens })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["app-user-profile", userId] });
      toast({
        title: "Success",
        description: "Notification settings updated.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update notification tokens:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });
}

// Hook to trigger immediate notification processing
export function useProcessNotifications() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-notifications', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      console.error("Failed to process notifications:", error);
    },
  });
}
