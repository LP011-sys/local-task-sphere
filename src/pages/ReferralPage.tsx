
import React from "react";
import ReferralDashboard from "@/components/referrals/ReferralDashboard";
import RequireAuth from "@/components/auth/RequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function ReferralPage() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  return (
    <RequireAuth>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground">
              Earn €5 for every friend you refer who completes their first paid task
            </p>
          </div>
          
          {user && <ReferralDashboard userId={user.id} />}
        </div>
      </div>
    </RequireAuth>
  );
}
