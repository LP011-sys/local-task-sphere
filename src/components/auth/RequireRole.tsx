
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/contexts/AdminRoleContext";

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RequireRole({ children, allowedRoles, redirectTo = "/" }: RequireRoleProps) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentRole, isAdmin } = useAdminRole();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth", { replace: true });
          return;
        }

        // If user is admin, allow access to everything
        if (isAdmin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check user roles in user_roles table
        const { data: userRoles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          toast({
            title: "Access Error",
            description: "Unable to verify your permissions",
            variant: "destructive"
          });
          navigate(redirectTo, { replace: true });
          return;
        }

        const userRoleList = userRoles?.map(r => r.role) || [];
        const hasRequiredRole = allowedRoles.some(role => userRoleList.includes(role));

        if (!hasRequiredRole) {
          toast({
            title: "Access Denied",
            description: "You do not have access to this section",
            variant: "destructive"
          });
          
          // Smart redirect based on user role
          const smartRedirect = userRoleList.includes("provider") ? "/dashboard" : "/";
          navigate(smartRedirect, { replace: true });
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error("Role check error:", error);
        navigate(redirectTo, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [allowedRoles, navigate, redirectTo, toast, isAdmin]);

  if (loading) {
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
