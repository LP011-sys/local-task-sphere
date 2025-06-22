
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIncrementTaskCompletion } from "@/hooks/useLoyaltyTier";

export function useTaskStatusMutation() {
  const queryClient = useQueryClient();
  const incrementTaskCompletion = useIncrementTaskCompletion();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      providerId,
    }: {
      taskId: string;
      status: "in_progress" | "done" | "completed" | "cancelled";
      providerId?: string;
    }) => {
      const { error } = await supabase
        .from("Tasks")
        .update({ status })
        .eq("id", taskId);
      if (error) throw error;

      // If task is completed and we have a provider ID, increment their task count
      if (status === "completed" && providerId) {
        await incrementTaskCompletion.mutateAsync(providerId);
      }

      return { status, providerId };
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate provider and customer tasks feed
      queryClient.invalidateQueries();
    },
  });
}
