
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
  showText?: boolean;
}

export function VerifiedBadge({ isVerified, className = "", showText = true }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  return (
    <Badge 
      variant="default" 
      className={`bg-blue-600 text-white px-2 py-1 text-xs font-medium ${className}`}
    >
      <CheckCircle className="w-3 h-3 mr-1" />
      {showText && "Verified"}
    </Badge>
  );
}
