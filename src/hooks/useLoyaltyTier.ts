
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
      return 0.10; // 10% discount
    case 'Silver':
      return 0.05; // 5% discount
    case 'Bronze':
    default:
      return 0; // No discount
  }
}

export function getNextTierInfo(tasksCompleted: number) {
  if (tasksCompleted < 5) {
    return {
      nextTier: 'Silver',
      tasksNeeded: 5 - tasksCompleted,
      progress: (tasksCompleted / 5) * 100
    };
  } else if (tasksCompleted < 15) {
    return {
      nextTier: 'Gold',
      tasksNeeded: 15 - tasksCompleted,
      progress: ((tasksCompleted - 5) / 10) * 100
    };
  } else {
    return {
      nextTier: null,
      tasksNeeded: 0,
      progress: 100
    };
  }
}

export const LOYALTY_TIERS = {
  Bronze: {
    range: '1–4 completed tasks',
    benefits: [
      '0% discount',
      'Access to all standard features'
    ]
  },
  Silver: {
    range: '5–14 completed tasks',
    benefits: [
      '5% platform fee discount',
      '1 free task boost per month',
      'Priority response from support'
    ]
  },
  Gold: {
    range: '15+ completed tasks',
    benefits: [
      '10% platform fee discount',
      '2 free task boosts per month',
      'Highlighted profile in provider listings',
      'Early access to new features'
    ]
  }
};
