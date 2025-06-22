
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Award, Medal } from "lucide-react";

interface LoyaltyBadgeProps {
  tier: 'Bronze' | 'Silver' | 'Gold';
  tasksCompleted?: number;
  showText?: boolean;
  className?: string;
}

export function LoyaltyBadge({ tier, tasksCompleted, showText = true, className = "" }: LoyaltyBadgeProps) {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return {
          icon: Crown,
          color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
          text: 'Gold',
          range: '15+ tasks'
        };
      case 'Silver':
        return {
          icon: Award,
          color: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
          text: 'Silver',
          range: '5-14 tasks'
        };
      case 'Bronze':
      default:
        return {
          icon: Medal,
          color: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
          text: 'Bronze',
          range: '1-4 tasks'
        };
    }
  };

  const config = getTierConfig(tier);
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.color} px-2 py-1 text-xs font-medium ${className}`}
      title={`${config.text} tier (${config.range})`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {showText && (
        <>
          {config.text}
          {tasksCompleted !== undefined && (
            <span className="ml-1 opacity-80">({tasksCompleted})</span>
          )}
        </>
      )}
    </Badge>
  );
}
