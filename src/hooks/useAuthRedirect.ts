
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectAfterAuth = async () => {
    try {
      console.log('useAuthRedirect: Starting redirect process');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('useAuthRedirect: No user found:', userError);
        return;
      }

      console.log('useAuthRedirect: User found:', user.id);

      // Try to get user profile with timeout
      const profilePromise = supabase
        .from("app_users")
        .select("roles, active_role, profile_completed")
        .eq("auth_user_id", user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      let profile = null;
      try {
        const { data } = await Promise.race([profilePromise, timeoutPromise]) as any;
        profile = data;
      } catch (error) {
        console.warn('useAuthRedirect: Profile fetch failed or timed out:', error);
      }

      // Determine user role with fallback logic
      let userRole = 'customer';
      if (profile?.active_role) {
        userRole = profile.active_role;
      } else if (profile?.roles?.[0]) {
        userRole = profile.roles[0];
      } else if (user.user_metadata?.active_role) {
        userRole = user.user_metadata.active_role;
      } else if (user.user_metadata?.roles?.[0]) {
        userRole = user.user_metadata.roles[0];
      }

      console.log('useAuthRedirect: Determined role:', userRole);

      // Redirect based on role
      switch (userRole) {
        case "provider":
          if (!profile?.profile_completed) {
            navigate("/complete-profile/provider", { replace: true });
          } else {
            navigate("/dashboard/provider", { replace: true });
          }
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          if (!profile?.profile_completed) {
            navigate("/complete-profile/customer", { replace: true });
          } else {
            navigate("/dashboard/customer", { replace: true });
          }
      }
    } catch (error) {
      console.error("useAuthRedirect: Redirect error:", error);
      toast.error("Authentication error. Please try again.");
      // Default redirect on error
      navigate("/dashboard/customer", { replace: true });
    }
  };

  return { redirectAfterAuth };
}
