import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Crown, Star, Zap, Shield, Check, Settings } from "lucide-react";
import { useSubscriptionPlans, useUserSubscription, useCreateSubscription, useCustomerPortal } from "@/hooks/useSubscription";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const planIcons = {
  starter: <Star className="text-blue-500" size={24} />,
  pro: <Crown className="text-yellow-500" size={24} />,
  team: <Shield className="text-purple-500" size={24} />
};

const planColors = {
  starter: "border-blue-200",
  pro: "border-yellow-300", 
  team: "border-purple-200"
};

export default function PremiumPackages() {
  const { toast } = useToast();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  
  // Get current user
  const { data: { user } } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    }
  });

  const { data: userProfile } = useCurrentUserProfile(user?.id);
  const { data: userSubscription } = useUserSubscription(user?.id);
  const createSubscription = useCreateSubscription();
  const customerPortal = useCustomerPortal();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    createSubscription.mutate(planId);
  };

  const handleManageSubscription = () => {
    customerPortal.mutate();
  };

  const hasActiveSubscription = userSubscription?.status === 'active';
  const currentPlanId = userSubscription?.plan_id;

  if (plansLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-center bg-white rounded-xl shadow-md p-6 border">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="text-primary" size={32} />
          <h1 className="text-2xl font-bold">Premium Plans</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of Task Hub with our premium plans. 
          Get more visibility, advanced features, and priority support.
        </p>
        
        {hasActiveSubscription && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              You have an active {plans?.find(p => p.id === currentPlanId)?.name} subscription
            </p>
            <Button 
              onClick={handleManageSubscription}
              variant="outline" 
              size="sm"
              className="mt-2"
              disabled={customerPortal.isPending}
            >
              <Settings className="w-4 h-4 mr-2" />
              {customerPortal.isPending ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const features = Array.isArray(plan.features) ? plan.features : [];
          
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-md border-2 ${planColors[plan.id as keyof typeof planColors]} ${
                plan.id === 'pro' ? "ring-2 ring-yellow-400 ring-offset-2" : ""
              } relative overflow-hidden`}
            >
              {plan.id === 'pro' && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                  Current Plan
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {planIcons[plan.id as keyof typeof planIcons]}
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">Perfect for growing businesses</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">€{plan.price_monthly}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={createSubscription.isPending || isCurrentPlan || !user}
                  className={`w-full min-w-[120px] ${
                    plan.id === 'pro' 
                      ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                      : "bg-primary text-white hover:bg-primary/90"
                  } px-4 py-2 rounded-md`}
                >
                  {createSubscription.isPending ? "Processing..." : 
                   isCurrentPlan ? "Current Plan" :
                   !user ? "Sign In Required" : "Subscribe Now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for all premium plans if you're not satisfied.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I upgrade or downgrade?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Changes will be prorated based on your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
