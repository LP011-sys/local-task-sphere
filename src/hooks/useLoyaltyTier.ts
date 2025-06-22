
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useIncrementTaskCompletion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('increment_user_completed_tasks', {
        user_uuid: userId
      });

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      // Invalidate user profile to refresh tier data
      queryClient.invalidateQueries({ queryKey: ["app-user-profile", userId] });
      
      toast({
        title: "Task Completed!",
        description: "Your loyalty tier has been updated.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update task completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task completion status.",
        variant: "destructive",
      });
    },
  });
}

export function getLoyaltyTier(tasksCompleted: number): 'Bronze' | 'Silver' | 'Gold' {
  if (tasksCompleted >= 15) return 'Gold';
  if (tasksCompleted >= 5) return 'Silver';
  return 'Bronze';
}

export function getPlatformFeeDiscount(tier: 'Bronze' | 'Silver' | 'Gold'): number {
  switch (tier) {
    case 'Gold':
      return 0.02; // 2% discount
    case 'Silver':
      return 0.01; // 1% discount
    case 'Bronze':
    default:
      return 0; // No discount
  }
}
