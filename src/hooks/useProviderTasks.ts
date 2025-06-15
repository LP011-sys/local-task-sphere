
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

export function useProviderTasks(
  category: string,
  budgetMin: string,
  budgetMax: string,
  search: string
) {
  async function fetchProviderTasks(): Promise<any[]> {
    let query = supabase
      .from("Tasks")
      .select("*")
      .eq("status", "open");

    if (category) query = query.eq("category", category);
    if (budgetMin !== "") query = query.gte("price", budgetMin);
    if (budgetMax !== "") query = query.lte("price", budgetMax);
    if (search.trim() !== "") {
      query = query.or(`offer.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    const result = data as any[];
    result.sort(
      (a, b) =>
        (BOOST_ORDER[a.boost_status as keyof typeof BOOST_ORDER] ?? 2) -
        (BOOST_ORDER[b.boost_status as keyof typeof BOOST_ORDER] ?? 2)
    );
    return result;
  }
  return useQuery<any[], Error>({
    queryKey: ["providerFeedTasks", category, budgetMin, budgetMax, search],
    queryFn: fetchProviderTasks,
    staleTime: 120_000,
  });
}
