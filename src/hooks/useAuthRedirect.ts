
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
        .select("roles, active_role")
        .eq("auth_user_id", user.id)
        .single();

      if (error || !profile) {
        console.log('Profile fetch error or no profile:', error);
        
        // If no profile exists, check user metadata for role
        const userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
        console.log('Using metadata role for redirect:', userRole);
        
        // Redirect based on metadata role to complete profile
        if (userRole === "provider") {
          navigate("/complete-profile/provider");
        } else {
          navigate("/complete-profile/customer");
        }
        return;
      }

      console.log('User profile found:', profile);

      // Use active_role if available, otherwise fall back to first role, then default to customer
      const userRole = profile.active_role || profile.roles?.[0] || 'customer';

      console.log('Redirecting to dashboard for role:', userRole);

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
