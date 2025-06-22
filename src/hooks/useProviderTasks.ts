
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches provider-viewable tasks (status "open", or optionally filter).
 * Now includes real-time updates for task changes and sorts by boost status.
 * Also includes provider verification status for displaying badges.
 * @param opts Optional: { userId, status }
 */
export function useProviderTasks(userId?: string, status: string = "open") {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["provider-tasks", { status }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Tasks")
        .select(`
          *,
          provider:app_users!Tasks_user_id_fkey(
            id,
            name,
            is_verified
          )
        `)
        .eq("status", status)
        .order("is_boosted", { ascending: false })
        .order("deadline", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Real-time subscription for task changes
  useEffect(() => {
    const channel = supabase
      .channel('provider-tasks-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Tasks',
          filter: `status=eq.${status}`
        },
        (payload) => {
          console.log('New task added:', payload);
          queryClient.invalidateQueries({ queryKey: ["provider-tasks", { status }] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Tasks'
        },
        (payload) => {
          console.log('Task updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["provider-tasks", { status }] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Tasks'
        },
        (payload) => {
          console.log('Task deleted:', payload);
          queryClient.invalidateQueries({ queryKey: ["provider-tasks", { status }] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, queryClient]);

  return query;
}
