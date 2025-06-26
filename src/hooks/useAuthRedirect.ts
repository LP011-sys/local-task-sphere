
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
      let profile = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!profile && attempts < maxAttempts) {
        const { data, error } = await supabase
          .from("app_users")
          .select("role, roles, active_role")
          .eq("auth_user_id", user.id)
          .single();

        if (data) {
          profile = data;
        } else if (error) {
          console.log(`Profile fetch attempt ${attempts + 1} failed:`, error);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!profile) {
        console.error('Could not find user profile after', maxAttempts, 'attempts');
        navigate("/dashboard/customer");
        return;
      }

      console.log('User profile:', profile);

      // Use active_role if available, otherwise fall back to role
      const userRole = profile.active_role || profile.role;

      console.log('Redirecting to role:', userRole);

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
