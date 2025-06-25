
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectAfterAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from("app_users")
        .select("role, roles, active_role")
        .eq("auth_user_id", user.id)
        .single();

      // Use active_role if available, otherwise fall back to role
      const userRole = profile?.active_role || profile?.role;

      // Redirect based on active role
      if (userRole === "customer") {
        navigate("/dashboard/customer");
      } else if (userRole === "provider") {
        navigate("/dashboard/provider");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        // Default to customer dashboard for users without a role
        navigate("/dashboard/customer");
      }
    } catch (error) {
      console.error("Redirect error:", error);
      // Default redirect on error
      navigate("/dashboard/customer");
    }
  };

  return { redirectAfterAuth };
}
