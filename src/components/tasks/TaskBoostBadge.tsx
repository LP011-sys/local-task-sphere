
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

interface TaskBoostBadgeProps {
  isBoosted: boolean;
  boostExpiresAt?: string | null;
  className?: string;
}

export default function TaskBoostBadge({ isBoosted, boostExpiresAt, className = "" }: TaskBoostBadgeProps) {
  if (!isBoosted) return null;

  // Check if boost is still active
  const isActive = boostExpiresAt ? new Date(boostExpiresAt) > new Date() : false;

  if (!isActive) return null;

  return (
    <Badge 
      variant="default" 
      className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 text-xs font-medium ${className}`}
    >
      <Rocket className="w-3 h-3 mr-1" />
      Boosted
    </Badge>
  );
}
