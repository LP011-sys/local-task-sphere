
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export function useCurrentUserProfile(userId: string | undefined) {
  return useQuery<Tables<"app_users"> | null>({
    queryKey: ["app-user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateCurrentUserProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: TablesUpdate<"app_users">) => {
      if (!userId) throw new Error("No user id");
      const { error, data } = await supabase
        .from("app_users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["app-user-profile"] });
    }
  });
}
