
// Mutation for changing task status (e.g., Mark as Done, Confirm Completion)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: "in_progress" | "done" | "completed" | "cancelled";
    }) => {
      const { error } = await supabase
        .from("Tasks")
        .update({ status })
        .eq("id", taskId);
      if (error) throw error;
      return status;
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate provider and customer tasks feed
      queryClient.invalidateQueries();
    },
  });
}
