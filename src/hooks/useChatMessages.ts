
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Message = {
  id: string;
  task_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export function useChatMessages(taskId: string | undefined) {
  return useQuery({
    queryKey: ["messages", taskId],
    queryFn: async (): Promise<Message[]> => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!taskId,
    refetchInterval: 3000, // poll every 3s for simplicity
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      task_id,
      sender_id,
      receiver_id,
      content,
    }: Omit<Message, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ task_id, sender_id, receiver_id, content }]);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.task_id] });
    },
  });
}
