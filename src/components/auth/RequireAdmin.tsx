
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    async function checkAdmin() {
      setLoading(true);
      const { data: { session }} = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate("/");
        return;
      }
      // Check admin role from Supabase user_roles
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (ignore) return;
      if (error || !data) {
        setIsAdmin(false);
        navigate("/");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    }
    checkAdmin();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-lg text-muted-foreground">Checking admin permissions...</div>
    );
  }
  if (!isAdmin) return null;
  return <>{children}</>;
}
