
import React from "react";
import { Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreditDisplayProps {
  creditBalance: number;
  className?: string;
  showIcon?: boolean;
}

export default function CreditDisplay({ 
  creditBalance, 
  className = "", 
  showIcon = true 
}: CreditDisplayProps) {
  if (creditBalance <= 0) return null;

  return (
    <Badge variant="default" className={`bg-green-100 text-green-800 ${className}`}>
      {showIcon && <Euro className="w-3 h-3 mr-1" />}
      €{creditBalance.toFixed(2)} Credit
    </Badge>
  );
}
