
import React from "react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

interface RequireProfileCompletionProps {
  children: React.ReactNode;
}

export default function RequireProfileCompletion({ children }: RequireProfileCompletionProps) {
  const { loading, profileComplete } = useProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Checking profile...</p>
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    return null; // Navigation will be handled by the hook
  }

  return <>{children}</>;
}
