
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Shield } from "lucide-react";

interface SubscriptionBadgeProps {
  planId: string | null;
  className?: string;
}

const planConfig = {
  starter: {
    icon: Star,
    label: "Starter",
    className: "bg-blue-600 text-white"
  },
  pro: {
    icon: Crown,
    label: "Pro",
    className: "bg-yellow-500 text-white"
  },
  team: {
    icon: Shield,
    label: "Team",
    className: "bg-purple-600 text-white"
  }
};

export function SubscriptionBadge({ planId, className = "" }: SubscriptionBadgeProps) {
  if (!planId || !(planId in planConfig)) return null;
  
  const config = planConfig[planId as keyof typeof planConfig];
  const Icon = config.icon;

  return (
    <Badge 
      variant="default" 
      className={`${config.className} px-2 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
