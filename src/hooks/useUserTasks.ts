
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserTasks() {
  return useQuery({
    queryKey: ["UserTasks"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        return [];
      }

      const { data } = await supabase
        .from("Tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      
      return data ?? [];
    },
  });
}
