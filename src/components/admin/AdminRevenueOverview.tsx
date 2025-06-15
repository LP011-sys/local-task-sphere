
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function sum(arr: any[], field: string) {
  return arr.reduce((acc, x) => acc + (Number(x[field]) || 0), 0);
}

export default function AdminRevenueOverview() {
  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ["admin-all-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("id, email, name, subscription_plan, role");
      if (error) throw error;
      return data || [];
    },
  });

  // Revenue stats
  const totalPlatformRevenue = payments ? sum(payments, "amount_platform_fee") : 0;

  // Revenue per subscription tier
  let revenueByTier: Record<string, number> = {};
  if (payments && users) {
    // map userId to plan
    const userPlans: Record<string, string> = {};
    users.forEach((u: any) => { userPlans[u.id] = u.subscription_plan ?? "free"; });
    for (const p of payments) {
      const plan = userPlans[p.provider_id] ?? "free";
      revenueByTier[plan] = (revenueByTier[plan] || 0) + (Number(p.amount_platform_fee) || 0);
    }
  }

  // Top customers by total spend
  let topCustomers: { id: string; email?: string; spend: number }[] = [];
  if (payments && users) {
    const spendMap: Record<string, number> = {};
    payments.forEach((p: any) => {
      spendMap[p.customer_id] = (spendMap[p.customer_id] || 0) + (Number(p.amount_total) || 0);
    });
    topCustomers = Object.keys(spendMap)
      .map(id => ({
        id,
        email: users.find((u: any) => u.id === id)?.email ?? id,
        spend: spendMap[id],
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }

  // Top providers by earnings (amount_provider)
  let topProviders: { id: string; email?: string; earned: number }[] = [];
  if (payments && users) {
    const earnMap: Record<string, number> = {};
    payments.forEach((p: any) => {
      earnMap[p.provider_id] = (earnMap[p.provider_id] || 0) + (Number(p.amount_provider) || 0);
    });
    topProviders = Object.keys(earnMap)
      .map(id => ({
        id,
        email: users.find((u: any) => u.id === id)?.email ?? id,
        earned: earnMap[id],
      }))
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 5);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="text-center p-6">
          <div className="text-2xl font-bold">€{totalPlatformRevenue.toFixed(2)}</div>
          <div className="text-sm mt-2 text-muted-foreground">Total Platform Revenue</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-xl font-semibold mb-1">By Subscription Tier</div>
          <ul className="text-left text-sm mt-2 space-y-1">
            {Object.keys(revenueByTier).length === 0
              ? <li className="text-muted-foreground">-</li>
              : Object.entries(revenueByTier).map(([plan, amt]) =>
                <li key={plan} className="capitalize">{plan}: <span className="font-bold">€{amt.toFixed(2)}</span></li>
              )
            }
          </ul>
        </Card>
        <Card className="text-center p-6">
          <div className="text-xl font-semibold mb-1">Payments</div>
          <div className="text-muted-foreground text-sm mt-2">{payments?.length ?? 0} payments</div>
        </Card>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-semibold mb-2">Top Customers by Spend</div>
          <ol className="text-sm list-decimal pl-5">
            {topCustomers.length === 0
              ? <li className="text-muted-foreground">-</li>
              : topCustomers.map(c => (
                  <li key={c.id}>
                    <span className="font-bold">{c.email}</span>: €{c.spend.toFixed(2)}
                  </li>
                ))}
          </ol>
        </Card>
        <Card className="p-4">
          <div className="font-semibold mb-2">Top Providers by Earnings</div>
          <ol className="text-sm list-decimal pl-5">
            {topProviders.length === 0
              ? <li className="text-muted-foreground">-</li>
              : topProviders.map(p => (
                  <li key={p.id}>
                    <span className="font-bold">{p.email}</span>: €{p.earned.toFixed(2)}
                  </li>
                ))}
          </ol>
        </Card>
      </div>
      {(isLoading) && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" /> Loading revenue...
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-center py-10 text-red-400">
          Failed to load revenue data.
        </div>
      )}
    </div>
  );
}

