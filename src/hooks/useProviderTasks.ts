
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 1. Shallow Task type (only flat fields needed in the UI & filtering)
type Task = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category?: string;
  boost?: string;
  location?: string;
};

// 2. Fetch function - always cast to Task[]
const fetchProviderTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("Tasks")
    .select("*")
    .eq("status", "open");

  if (error) throw error;
  // Type assertion/cast here is deliberate to prevent deep inference
  return (data ?? []) as Task[];
};

// 3. React Query hook for provider tasks
export function useProviderTasks(
  category: string,
  budgetMin: string,
  budgetMax: string,
  search: string
) {
  // No generic annotation! Let TypeScript infer
  return useQuery({
    queryKey: ["providerTasks", category, budgetMin, budgetMax, search],
    queryFn: fetchProviderTasks,
    select: (tasks) => {
      // Filtering (client-side)
      let result = tasks as Task[];
      if (category) {
        result = result.filter((task) => task.category === category);
      }
      if (budgetMin !== "") {
        result = result.filter((task) => Number(task.budget) >= Number(budgetMin));
      }
      if (budgetMax !== "") {
        result = result.filter((task) => Number(task.budget) <= Number(budgetMax));
      }
      if (search.trim() !== "") {
        const s = search.trim().toLowerCase();
        result = result.filter(
          (task) =>
            (task.title?.toLowerCase().includes(s) ?? false) ||
            (task.description?.toLowerCase().includes(s) ?? false)
        );
      }
      // Boosted tasks first (if boost exists)
      result.sort((a, b) => {
        if (a.boost === b.boost) return 0;
        if (a.boost === "24h") return -1;
        if (b.boost === "24h") return 1;
        if (a.boost === "8h") return -1;
        if (b.boost === "8h") return 1;
        return 0;
      });
      return result;
    },
    staleTime: 120_000,
  });
}
