
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  totalOffers: number;
  tasksCompleted: number;
  totalRevenue: number;
  averageTaskValue: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  tasksLast7Days: number;
  tasksLast30Days: number;
  offersLast7Days: number;
  offersLast30Days: number;
  providersCount: number;
  customersCount: number;
  activeProvidersThisWeek: number;
  repeatCustomers: number;
  tasksByDay: Array<{ date: string; count: number }>;
  revenueByWeek: Array<{ week: string; revenue: number }>;
  tasksByCategory: Array<{ category: string; count: number }>;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Basic counts
      const [
        { count: totalUsers },
        { count: totalTasks },
        { count: totalOffers },
        { count: tasksCompleted },
        { count: newUsersLast7Days },
        { count: newUsersLast30Days },
        { count: tasksLast7Days },
        { count: tasksLast30Days },
        { count: offersLast7Days },
        { count: offersLast30Days },
        { count: providersCount },
        { count: customersCount },
        { count: repeatCustomers }
      ] = await Promise.all([
        supabase.from("app_users").select("*", { count: "exact", head: true }),
        supabase.from("Tasks").select("*", { count: "exact", head: true }),
        supabase.from("offers").select("*", { count: "exact", head: true }),
        supabase.from("Tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("app_users").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("app_users").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("Tasks").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("Tasks").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("offers").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("offers").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "provider"),
        supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("app_users").select("id", { count: "exact", head: true }).eq("role", "customer")
      ]);

      // Revenue calculations
      const { data: payments } = await supabase
        .from("payments")
        .select("amount_total");

      const totalRevenue = (payments || []).reduce((acc, p) => acc + (p.amount_total || 0), 0);
      const averageTaskValue = totalTasks > 0 ? totalRevenue / totalTasks : 0;

      // Active providers this week
      const { count: activeProvidersThisWeek } = await supabase
        .from("offers")
        .select("provider_id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Tasks by day for the last 14 days
      const { data: tasksByDayData } = await supabase
        .from("Tasks")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo.toISOString())
        .order("created_at");

      const tasksByDay = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = (tasksByDayData || []).filter(task => 
          task.created_at.startsWith(dateStr)
        ).length;
        tasksByDay.push({ date: dateStr, count });
      }

      // Revenue by week (last 4 weeks)
      const revenueByWeek = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        
        const { data: weekPayments } = await supabase
          .from("payments")
          .select("amount_total")
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        const weekRevenue = (weekPayments || []).reduce((acc, p) => acc + (p.amount_total || 0), 0);
        revenueByWeek.push({ 
          week: `Week ${4 - i}`, 
          revenue: weekRevenue 
        });
      }

      // Tasks by category
      const { data: tasksData } = await supabase
        .from("Tasks")
        .select("category");

      const categoryCount: Record<string, number> = {};
      (tasksData || []).forEach(task => {
        const category = task.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const tasksByCategory = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count
      }));

      return {
        totalUsers: totalUsers || 0,
        totalTasks: totalTasks || 0,
        totalOffers: totalOffers || 0,
        tasksCompleted: tasksCompleted || 0,
        totalRevenue,
        averageTaskValue,
        newUsersLast7Days: newUsersLast7Days || 0,
        newUsersLast30Days: newUsersLast30Days || 0,
        tasksLast7Days: tasksLast7Days || 0,
        tasksLast30Days: tasksLast30Days || 0,
        offersLast7Days: offersLast7Days || 0,
        offersLast30Days: offersLast30Days || 0,
        providersCount: providersCount || 0,
        customersCount: customersCount || 0,
        activeProvidersThisWeek: activeProvidersThisWeek || 0,
        repeatCustomers: repeatCustomers || 0,
        tasksByDay,
        revenueByWeek,
        tasksByCategory
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
