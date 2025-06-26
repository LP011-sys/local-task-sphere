
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectAfterAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found for redirect');
        return;
      }

      console.log('Redirecting user:', user.id);

      // Get user profile to determine role
      const { data: profile, error } = await supabase
        .from("app_users")
        .select("role, active_role")
        .eq("auth_user_id", user.id)
        .single();

      if (error || !profile) {
        console.log('Profile fetch error or no profile:', error);
        // Default to customer dashboard if we can't determine role
        navigate("/dashboard/customer");
        return;
      }

      console.log('User profile:', profile);

      // Use active_role if available, otherwise fall back to role, then default to customer
      const userRole = profile.active_role || profile.role || 'customer';

      console.log('Redirecting to role:', userRole);

      // Redirect based on role
      if (userRole === "customer") {
        navigate("/dashboard/customer");
      } else if (userRole === "provider") {
        navigate("/dashboard/provider");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        // Default to customer dashboard
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
