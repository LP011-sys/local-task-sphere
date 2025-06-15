
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 1. Shallow Task type (matching Supabase table structure)
type Task = {
  id: string;
  description: string;
  category: string;
  boost?: string; // derived from boost_status
  location?: any; // can be JSON or string depending on usage
  deadline?: string;
  offer?: string;
  price?: string;
  type?: string;
  recurring?: boolean;
  acceptance_deadline?: string;
  suggested_price?: string;
  created_at?: string;
  images?: any;
};

// 2. Fetch function - no type cast, explicit shape conversion
const fetchProviderTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("Tasks")
    .select("*")
    .eq("status", "open");

  if (error) throw error;
  // Map each row into the Task shape, manually mapping/renaming as needed
  return (data ?? []).map((row: any) => ({
    id: row.id,
    description: row.description,
    category: row.category,
    boost: row.boost_status ?? undefined,
    location: row.location ?? undefined,
    deadline: row.deadline ?? undefined,
    offer: row.offer ?? undefined,
    price: row.price ?? undefined,
    type: row.type ?? undefined,
    recurring: row.recurring ?? undefined,
    acceptance_deadline: row.acceptance_deadline ?? undefined,
    suggested_price: row.suggested_price ?? undefined,
    created_at: row.created_at ?? undefined,
    images: row.images ?? undefined,
  }));
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
        result = result.filter(
          (task) => Number(task.price) >= minBudget
        );
      }
      if (hasValidMax) {
        result = result.filter(
          (task) => Number(task.price) <= maxBudget
        );
      }

      // Search term optimization
      const trimmedSearch = search.trim().toLowerCase();
      if (trimmedSearch !== "") {
        result = result.filter(
          (task) =>
            (task.offer?.toLowerCase().includes(trimmedSearch) ?? false) ||
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
