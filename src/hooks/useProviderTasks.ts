
// This hook now fetches all open tasks for providers to browse, not just tasks by a specific provider.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches provider-viewable tasks (status "open", or optionally filter).
 * @param opts Optional: { userId, status }
 */
export function useProviderTasks(userId?: string, status: string = "open") {
  return useQuery({
    queryKey: ["provider-tasks", { status }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Tasks")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 3000,
  });
}
