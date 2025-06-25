
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

      // Redirect based on role
      if (userRole === "customer") {
        navigate("/post-task");
      } else if (userRole === "provider") {
        navigate("/dashboard");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        // Default to customer for users without a role
        navigate("/post-task");
      }
    } catch (error) {
      console.error("Redirect error:", error);
      // Default redirect on error
      navigate("/post-task");
    }
  };

  return { redirectAfterAuth };
}
