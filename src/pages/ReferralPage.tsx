
import React from "react";
import ReferralDashboard from "@/components/referrals/ReferralDashboard";
import { useUser } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

export default function ReferralPage() {
  const user = useUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">
            Earn €5 for every friend you refer who completes their first paid task
          </p>
        </div>
        
        <ReferralDashboard userId={user.id} />
      </div>
    </div>
  );
}
