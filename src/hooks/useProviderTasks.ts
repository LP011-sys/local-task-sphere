
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 1. Define a "shallow" Task type, only with relevant flat fields used in filtering & sorting.
export type Task = {
  id: number;
  offer: string;
  description: string;
  category: string;
  price: number | string;
  status: string;
  boost_status?: "24h" | "8h" | "none" | "" | null; // nullable/optional
  location?: string | null;
  deadline?: string | null;
  // Any other top-level flat fields used for display/filtering/sorting? Add here as needed.
};

const BOOST_ORDER = {
  "24h": 0,
  "8h": 1,
  "none": 2,
  "": 2,
  null: 2,
  undefined: 2,
};

// 2. Fetch all open tasks and assert they match the Task type (flat fields).
async function fetchOpenTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("Tasks")
    .select("*")
    .eq("status", "open");

  if (error) throw error;
  // Simple cast for shallow type: only fields we use in app logic/UI
  return (data ?? []) as Task[];
}

export function useProviderTasks(
  category: string,
  budgetMin: string,
  budgetMax: string,
  search: string
) {
  // 3. Type everything here as Task[]
  return useQuery<Task[]>({
    queryKey: ["providerFeedTasks", category, budgetMin, budgetMax, search],
    queryFn: async () => {
      let tasks = await fetchOpenTasks();

      // Client-side filtering (using shallow fields)
      if (category) {
        tasks = tasks.filter((task) => task.category === category);
      }
      if (budgetMin !== "") {
        tasks = tasks.filter((task) => Number(task.price) >= Number(budgetMin));
      }
      if (budgetMax !== "") {
        tasks = tasks.filter((task) => Number(task.price) <= Number(budgetMax));
      }
      if (search.trim() !== "") {
        const s = search.trim().toLowerCase();
        tasks = tasks.filter(
          (task) =>
            (task.offer?.toLowerCase().includes(s) ?? false) ||
            (task.description?.toLowerCase().includes(s) ?? false)
        );
      }

      // Sort by boost_status
      tasks.sort(
        (a, b) =>
          (BOOST_ORDER[a.boost_status as keyof typeof BOOST_ORDER] ?? 2) -
          (BOOST_ORDER[b.boost_status as keyof typeof BOOST_ORDER] ?? 2)
      );
      return tasks;
    },
    staleTime: 120_000,
  });
}
