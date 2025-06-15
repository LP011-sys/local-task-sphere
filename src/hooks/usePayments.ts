
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Payment status types
export type PaymentStatus = "pending" | "paid" | "released";

export type Payment = {
  id: string;
  task_id: string;
  customer_id: string;
  provider_id: string;
  amount_total: number;
  amount_platform_fee: number;
  amount_provider: number;
  status: PaymentStatus;
  created_at: string;
};

export function useTaskPayments(taskId?: string) {
  return useQuery({
    queryKey: ["payments", taskId],
    queryFn: async (): Promise<Payment[]> => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!taskId,
    refetchInterval: 3000,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      task_id,
      customer_id,
      provider_id,
      amount_total,
      amount_platform_fee,
      amount_provider,
      status,
    }: Omit<Payment, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("payments")
        .insert([{ task_id, customer_id, provider_id, amount_total, amount_platform_fee, amount_provider, status }]);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", variables.task_id] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status: PaymentStatus }) => {
      const { data, error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
      }
    },
  });
}
