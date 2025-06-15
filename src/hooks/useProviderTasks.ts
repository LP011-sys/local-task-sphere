
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all tasks assigned to a provider by userId.
 * @param userId The provider's user ID (string or undefined)
 */
export function useProviderTasks(userId: string | undefined) {
  // Avoids TypeScript deep recursion by using any[]
  return useQuery<any[]>({
    queryKey: ["provider-tasks", userId ?? "anon"],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("Tasks")
        .select("*")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    refetchInterval: 3000,
  });
}

