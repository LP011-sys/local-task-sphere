
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTasks(userId?: string) {
  return useQuery({
    queryKey: ["Tasks", userId],
    queryFn: async () => {
      let query = supabase.from("Tasks").select("*").order("created_at", { ascending: false });
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data } = await query;
      return data ?? [];
    },
  });
}
