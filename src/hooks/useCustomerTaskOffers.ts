
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Offer type matching the new offers table
export type Offer = {
  id: string;
  task_id: string;
  provider_id: string;
  message?: string | null;
  price?: string | null;
  created_at: string;
  status: "pending" | "accepted" | "rejected" | string;
  provider?: {
    id: string;
    name: string;
    profile_photo?: string | null;
  };
};

// Task, including the joined offers
export type CustomerTask = {
  id: string;
  description: string;
  category: string;
  deadline?: string | null;
  created_at: string;
  // Expand as needed
  offers: Offer[];
};

export function useCustomerTaskOffers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["customer-tasks-with-offers"],
    queryFn: async (): Promise<CustomerTask[]> => {
      // Fetch customer tasks and all offers for them, joining provider info if possible
      const { data, error } = await supabase
        .from("Tasks")
        .select(`
          id,
          description,
          category,
          deadline,
          created_at,
          offers:offers (
            id,
            message,
            price,
            created_at,
            status,
            provider_id,
            provider:provider_id (
              id,
              name,
              profile_photo
            )
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Fallback to empty offers array if needed and flatten types
      return (data ?? []).map((t: any) => ({
        ...t,
        offers: (t.offers ?? []).map((o: any) => ({
          ...o,
          provider: o.provider,
        })),
      }));
    },
    staleTime: 60_000,
  });

  // Real-time subscription for offer changes
  useEffect(() => {
    const channel = supabase
      .channel('customer-offers-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers'
        },
        (payload) => {
          console.log('New offer received:', payload);
          queryClient.invalidateQueries({ queryKey: ["customer-tasks-with-offers"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'offers'
        },
        (payload) => {
          console.log('Offer updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["customer-tasks-with-offers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Accept/reject offer mutation
export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: { offerId: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase
        .from("offers")
        .update({ status })
        .eq("id", offerId);
      if (error) throw error;
      return status;
    },
    onSuccess: () => {
      // Invalidate the query to refresh offers list
      queryClient.invalidateQueries({ queryKey: ["customer-tasks-with-offers"] });
    },
  });
}
