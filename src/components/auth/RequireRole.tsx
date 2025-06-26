
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/contexts/UserRoleContext";

type Role = "customer" | "provider" | "admin";

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export default function RequireRole({ children, allowedRoles, redirectTo = "/" }: RequireRoleProps) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentRole, availableRoles, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth", { replace: true });
          return;
        }

        // Wait for role context to load
        if (roleLoading) {
          return;
        }

        // Check if current role is allowed
        const hasRequiredRole = allowedRoles.includes(currentRole);

        if (!hasRequiredRole) {
          // Check if user has any of the required roles available
          const hasAnyRequiredRole = availableRoles.some(role => allowedRoles.includes(role));
          
          if (hasAnyRequiredRole) {
            // User has the role but it's not active - show switch prompt
            toast({
              title: "Switch Role Required",
              description: `You need to switch to ${allowedRoles[0]} role to access this page`,
              variant: "default"
            });
          } else {
            // User doesn't have any of the required roles
            toast({
              title: "Access Denied",
              description: "You do not have access to this section",
              variant: "destructive"
            });
          }
          
          // Smart redirect based on user's current role
          const smartRedirect = currentRole === "provider" ? "/dashboard/provider" : "/dashboard/customer";
          navigate(smartRedirect, { replace: true });
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error("Role check error:", error);
        navigate("/dashboard/customer", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [allowedRoles, navigate, redirectTo, toast, currentRole, availableRoles, roleLoading]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
