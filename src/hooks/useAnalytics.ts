
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsSnapshot {
  id: string;
  snapshot_date: string;
  week_start: string;
  week_end: string;
  mau: number;
  tasks_posted: number;
  tasks_completed: number;
  boost_purchases: number;
  subscription_count: number;
  total_revenue: number;
  created_at: string;
}

export interface CurrentAnalytics {
  mau: number;
  tasks_posted: number;
  tasks_completed: number;
  boost_purchases: number;
  subscription_count: number;
  total_revenue: number;
}

export function useAnalyticsSnapshots() {
  return useQuery({
    queryKey: ["analytics-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(12); // Last 12 weeks

      if (error) throw error;
      return data as AnalyticsSnapshot[];
    },
  });
}

export function useCurrentAnalytics() {
  return useQuery({
    queryKey: ["current-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_analytics");
      
      if (error) throw error;
      return data[0] as CurrentAnalytics;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useCalculateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("calculate_weekly_analytics");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["current-analytics"] });
    },
  });
}

export function useTriggerWeeklyAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('weekly-analytics');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["current-analytics"] });
    },
  });
}
