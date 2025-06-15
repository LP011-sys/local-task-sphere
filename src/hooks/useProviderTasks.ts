
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
  return useQuery({
    queryKey: ["providerTasks", category, budgetMin, budgetMax, search],
    queryFn: fetchProviderTasks,
    select: (tasks) => {
      let result = tasks as Task[];

      // Budget filtering optimization
      const minBudget = Number(budgetMin);
      const hasValidMin = !isNaN(minBudget) && budgetMin !== "";
      const maxBudget = Number(budgetMax);
      const hasValidMax = !isNaN(maxBudget) && budgetMax !== "";

      if (category) {
        result = result.filter((task) => task.category === category);
      }
      if (hasValidMin) {
        result = result.filter((task) => Number(task.budget) >= minBudget);
      }
      if (hasValidMax) {
        result = result.filter((task) => Number(task.budget) <= maxBudget);
      }

      // Search term optimization
      const trimmedSearch = search.trim().toLowerCase();
      if (trimmedSearch !== "") {
        result = result.filter(
          (task) =>
            (task.title?.toLowerCase().includes(trimmedSearch) ?? false) ||
            (task.description?.toLowerCase().includes(trimmedSearch) ?? false)
        );
      }

      // Boost sorting optimization
      const boostRank: Record<string, number> = { "24h": 2, "8h": 1, none: 0 };
      result.sort(
        (a, b) =>
          (boostRank[b.boost ?? "none"] ?? 0) - (boostRank[a.boost ?? "none"] ?? 0)
      );

      return result;
    },
    staleTime: 120_000,
  });
}
