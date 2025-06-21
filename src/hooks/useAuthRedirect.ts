
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
        .select("role")
        .eq("id", user.id)
        .single();

      // Redirect based on role
      if (profile?.role === "customer") {
        navigate("/post-task");
      } else if (profile?.role === "provider") {
        navigate("/dashboard");
      } else if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Redirect error:", error);
      navigate("/");
    }
  };

  return { redirectAfterAuth };
}
