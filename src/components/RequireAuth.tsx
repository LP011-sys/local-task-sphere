
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data?.user);
      setLoading(false);
      if (!data?.user) navigate("/auth", { replace: true });
    });
    return () => {
      sub.data?.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-lg text-muted-foreground">
        Checking authentication...
      </div>
    );
  }

  if (!authed) {
    return null;
  }
  return <>{children}</>;
}
