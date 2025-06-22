
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useVerificationPayment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("create-verification-payment", {
        body: { user_id: userId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Redirected to payment",
          description: "Complete your verification payment in the opened tab.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment error",
        description: error.message || "Failed to process verification payment",
        variant: "destructive",
      });
    },
  });
}

export function useMarkUserVerified() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("app_users")
        .update({ is_verified: true })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-user-profile"] });
    },
  });
}
