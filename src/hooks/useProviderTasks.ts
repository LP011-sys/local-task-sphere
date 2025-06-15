
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BOOST_ORDER = {
  "24h": 0,
  "8h": 1,
  "none": 2,
  "": 2,
  null: 2,
  undefined: 2,
};

// Get all open tasks from supabase and filter on the client
async function fetchOpenTasks(): Promise<any[]> {
  const { data, error } = await supabase
    .from("Tasks")
    .select("*")
    .eq("status", "open");

  if (error) throw error;
  return data as any[];
}

export function useProviderTasks(
  category: string,
  budgetMin: string,
  budgetMax: string,
  search: string
) {
  return useQuery({
    queryKey: ["providerFeedTasks", category, budgetMin, budgetMax, search],
    queryFn: async () => {
      let tasks = await fetchOpenTasks();

      // Client-side filtering
      if (category) {
        tasks = tasks.filter((task: any) => task.category === category);
      }
      if (budgetMin !== "") {
        tasks = tasks.filter((task: any) => Number(task.price) >= Number(budgetMin));
      }
      if (budgetMax !== "") {
        tasks = tasks.filter((task: any) => Number(task.price) <= Number(budgetMax));
      }
      if (search.trim() !== "") {
        const s = search.trim().toLowerCase();
        tasks = tasks.filter(
          (task: any) =>
            (task.offer?.toLowerCase().includes(s) ?? false) ||
            (task.description?.toLowerCase().includes(s) ?? false)
        );
      }

      // Sort by boost_status
      tasks.sort(
        (a: any, b: any) =>
          (BOOST_ORDER[a.boost_status as keyof typeof BOOST_ORDER] ?? 2) -
          (BOOST_ORDER[b.boost_status as keyof typeof BOOST_ORDER] ?? 2)
      );
      return tasks;
    },
    staleTime: 120_000,
  });
}
