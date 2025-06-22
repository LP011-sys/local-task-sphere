
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SubscriptionBadge } from "@/components/ui/subscription-badge";

interface TaskBoostBadgeProps {
  isBoosted: boolean;
  boostExpiresAt?: string | null;
  isProviderVerified?: boolean;
  providerSubscriptionPlan?: string | null;
  className?: string;
}

export default function TaskBoostBadge({ 
  isBoosted, 
  boostExpiresAt, 
  isProviderVerified,
  providerSubscriptionPlan,
  className = "" 
}: TaskBoostBadgeProps) {
  // Check if boost is still active
  const isBoostActive = isBoosted && boostExpiresAt ? new Date(boostExpiresAt) > new Date() : false;

  return (
    <div className={`flex gap-2 ${className}`}>
      {isBoostActive && (
        <Badge 
          variant="default" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 text-xs font-medium"
        >
          <Rocket className="w-3 h-3 mr-1" />
          Boosted
        </Badge>
      )}
      <VerifiedBadge isVerified={isProviderVerified || false} showText={false} />
      <SubscriptionBadge planId={providerSubscriptionPlan} />
    </div>
  );
}
