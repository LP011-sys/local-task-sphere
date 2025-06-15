
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    id: "free",
    label: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    commission: 0.2,
    features: [
      "20% commission",
      "No task boosts",
    ],
  },
  {
    id: "plus",
    label: "Plus",
    priceMonthly: 5,
    priceYearly: 50,
    commission: 0.15,
    features: [
      "15% commission",
      "1 free 8h boost/mo",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    priceMonthly: 12,
    priceYearly: 120,
    commission: 0.10,
    features: [
      "10% commission",
      "3 free 24h boosts/mo",
      "Auto-prioritized in feed",
    ],
  },
];

const getFormattedPrice = (pkg: typeof PACKAGES[0], yearly: boolean) =>
  pkg.id === "free"
    ? "€0"
    : yearly
    ? `€${pkg.priceYearly}/year`
    : `€${pkg.priceMonthly}/month`;

export default function PremiumPackages() {
  // Demo/mock: Replace with actual user plan/query in real app!
  const [userPlan, setUserPlan] = useState<"free" | "plus" | "pro">("free");
  const [subscribed, setSubscribed] = useState<boolean>(userPlan !== "free");
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  async function handleSelectPlan(id: string) {
    setLoadingPkg(id);
    toast({ title: "Redirecting...", description: "Connecting to Stripe Checkout..." });
    try {
      // TODO: Integrate real Stripe Checkout via edge function
      // const { data, error } = await supabase.functions.invoke('create-checkout', { body: { plan: id, interval: isYearly ? "year" : "month" } });
      // if (error) throw error;
      // window.open(data.url, "_blank");
      setTimeout(() => {
        setUserPlan(id as any); // For demo/mock
        setSubscribed(id !== "free");
        toast({ title: "Success!", description: "Demo Stripe Checkout simulated. Your plan will update automatically in real use." });
        setLoadingPkg(null);
      }, 1200);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || String(e) });
      setLoadingPkg(null);
    }
  }

  // Demo customer portal, would be Stripe Customer Portal in production
  function handleManageSubscription() {
    toast({
      title: "Manage Subscription",
      description: "You'd be sent to the Stripe customer portal here.",
    });
    // TODO: Real: window.open(data.url, "_blank");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 text-primary text-center">Premium Packages</h1>
      <p className="text-center text-muted-foreground mb-8">Choose your subscription plan to unlock better commissions and boost your tasks.</p>
      <div className="flex items-center justify-center mb-8 gap-2">
        <span className={cn(!isYearly && "font-bold text-primary")}>Monthly</span>
        <button
          className={cn(
            "mx-1 w-10 h-6 rounded-full bg-muted relative transition-colors",
            isYearly ? "bg-primary/70" : "bg-muted"
          )}
          aria-label="Toggle yearly"
          onClick={() => setIsYearly(y => !y)}
        >
          <span
            className={cn(
              "block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform",
              isYearly ? "translate-x-4 bg-primary" : "translate-x-0"
            )}
          />
        </button>
        <span className={cn(isYearly && "font-bold text-primary")}>Yearly</span>
        {isYearly && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Save ~20%</span>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {PACKAGES.map(pkg => {
          const selected = userPlan === pkg.id;
          return (
            <Card
              key={pkg.id}
              className={cn(
                "flex flex-col px-6 py-8 rounded-2xl shadow border transition-all",
                selected ? "border-primary ring-2 ring-primary" : "border-muted"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{pkg.label}</h2>
                {selected && (
                  <Badge className="bg-primary text-primary-foreground ml-2">Current Plan</Badge>
                )}
              </div>
              <div className="text-3xl font-bold mb-2">{getFormattedPrice(pkg, isYearly)}</div>
              <ul className="mb-6 text-sm space-y-1 list-disc pl-6 text-muted-foreground">
                {pkg.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Button
                disabled={selected || loadingPkg !== null}
                variant={selected ? "secondary" : "default"}
                className="mt-auto font-semibold text-base py-2"
                onClick={() => handleSelectPlan(pkg.id)}
              >
                {selected ? "Selected" : loadingPkg === pkg.id ? "Redirecting..." : "Select Plan"}
              </Button>
            </Card>
          );
        })}
      </div>
      <div className="flex items-center justify-center">
        {subscribed ? (
          <Button variant="outline" onClick={handleManageSubscription}>Manage Subscription</Button>
        ) : (
          <span className="text-xs text-muted-foreground">You're on the Free plan.</span>
        )}
      </div>
    </div>
  );
}
