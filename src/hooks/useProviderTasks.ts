
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fix: avoid deep recursion in query key type
export function useProviderTasks(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? ["provider-tasks", String(userId)] : ["provider-tasks", "anon"],
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
