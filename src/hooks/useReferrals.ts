
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  credit_awarded: boolean;
  credit_awarded_at: string | null;
  first_task_completed_at: string | null;
  created_at: string;
}

export interface CreditHistory {
  id: string;
  user_id: string;
  amount: number;
  type: 'referral_bonus' | 'referral_reward' | 'task_payment' | 'bonus';
  description: string | null;
  referral_id: string | null;
  task_id: string | null;
  created_at: string;
}

export function useUserReferrals(userId: string | undefined) {
  return useQuery<ReferralData[]>({
    queryKey: ["user-referrals", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreditHistory(userId: string | undefined) {
  return useQuery<CreditHistory[]>({
    queryKey: ["credit-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("credits_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        type: item.type as 'referral_bonus' | 'referral_reward' | 'task_payment' | 'bonus'
      }));
    },
    enabled: !!userId,
  });
}

export function useCreateReferral() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referralCode, referredUserId }: { referralCode: string; referredUserId: string }) => {
      // First, get the referrer by their referral code
      const { data: referrer, error: referrerError } = await supabase
        .from("app_users")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

      if (referrerError || !referrer) {
        throw new Error("Invalid referral code");
      }

      // Create the referral relationship
      const { data, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: referrer.id,
          referred_id: referredUserId,
          referral_code: referralCode
        })
        .select()
        .single();

      if (error) throw error;

      // Update the referred user's referred_by field
      await supabase
        .from("app_users")
        .update({ referred_by: referrer.id })
        .eq("id", referredUserId);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Referral Applied",
        description: "You'll earn €5 credit when you complete your first paid task!",
      });
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["app-user-profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Referral Error",
        description: error.message || "Failed to apply referral code",
        variant: "destructive",
      });
    },
  });
}

export function useAwardReferralCredits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referredUserId: string) => {
      const { data, error } = await supabase.rpc('award_referral_credits', {
        referred_user_id: referredUserId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Credits Awarded!",
        description: "Referral credits have been added to both accounts.",
      });
      queryClient.invalidateQueries({ queryKey: ["credit-history"] });
      queryClient.invalidateQueries({ queryKey: ["app-user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
    },
    onError: (error: any) => {
      console.error("Failed to award referral credits:", error);
    },
  });
}
