
import React from "react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RequireProfileCompletionProps {
  children: React.ReactNode;
}

export default function RequireProfileCompletion({ children }: RequireProfileCompletionProps) {
  const { loading, profileComplete, userRole } = useProfileCompletion();
  const navigate = useNavigate();

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

  // Allow access but show completion prompt if profile is incomplete
  if (!profileComplete) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Your profile is incomplete. Complete it to access all features.
            <Button 
              onClick={() => navigate(userRole === 'provider' ? '/complete-profile/provider' : '/complete-profile/customer')}
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              Complete Profile
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
