
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Returns user's notifications (default: unread)
export function useNotifications(userId: string | undefined, onlyUnread = true) {
  return useQuery({
    queryKey: ["notifications", userId, onlyUnread],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId);

      if (onlyUnread) query = query.eq("is_read", false);

      query = query.order("created_at", { ascending: false }).limit(20);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    refetchInterval: 30000, // poll every 30s
  });
}

// Mark a notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
      return true;
    },
    onSuccess: (_data, notificationId, _context) => {
      // Invalidate notifications so list updates
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
}
