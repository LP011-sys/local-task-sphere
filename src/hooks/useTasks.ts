
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTasks() {
  return useQuery({
    queryKey: ["Tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("Tasks").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
