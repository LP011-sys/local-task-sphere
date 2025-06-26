
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

      // Use user metadata for role determination (more reliable)
      const userRole = user.user_metadata?.active_role || user.user_metadata?.roles?.[0] || 'customer';
      
      console.log('useAuthRedirect: Determined role:', userRole);

      // Redirect based on role
      switch (userRole) {
        case "provider":
          navigate("/dashboard/provider", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/dashboard/customer", { replace: true });
      }
    } catch (error) {
      console.error("useAuthRedirect: Redirect error:", error);
      toast.error("Authentication error. Please try again.");
      navigate("/dashboard/customer", { replace: true });
    }
  };

  return { redirectAfterAuth };
}
