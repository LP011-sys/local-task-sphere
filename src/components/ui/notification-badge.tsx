
import React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  children: React.ReactNode;
  show?: boolean;
  count?: number;
  className?: string;
}

export function NotificationBadge({ 
  children, 
  show = false, 
  count, 
  className 
}: NotificationBadgeProps) {
  return (
    <div className="relative inline-block">
      {children}
      {show && (
        <div className={cn(
          "absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse",
          className
        )}>
          {count && count > 0 ? (count > 99 ? "99+" : count) : ""}
        </div>
      )}
    </div>
  );
}
