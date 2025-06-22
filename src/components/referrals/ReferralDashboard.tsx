
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, Euro, Copy } from "lucide-react";
import { useUserReferrals, useCreditHistory } from "@/hooks/useReferrals";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useToast } from "@/hooks/use-toast";

interface ReferralDashboardProps {
  userId: string;
}

export default function ReferralDashboard({ userId }: ReferralDashboardProps) {
  const { data: userProfile } = useCurrentUserProfile(userId);
  const { data: referrals = [] } = useUserReferrals(userId);
  const { data: creditHistory = [] } = useCreditHistory(userId);
  const { toast } = useToast();

  const creditBalance = userProfile?.credit_balance || 0;
  const referralCode = userProfile?.referral_code;
  const referralUrl = referralCode ? `${window.location.origin}?ref=${referralCode}` : "";

  const handleCopyReferralLink = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const handleShareReferralLink = () => {
    if (navigator.share && referralUrl) {
      navigator.share({
        title: "Join me on our platform!",
        text: "Use my referral code to get €5 credit when you complete your first task!",
        url: referralUrl,
      });
    } else {
      handleCopyReferralLink();
    }
  };

  const totalEarned = Array.isArray(creditHistory) 
    ? creditHistory
        .filter(credit => credit.type === 'referral_bonus')
        .reduce((sum, credit) => sum + credit.amount, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Credit Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-green-600" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            €{creditBalance.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available for your next purchase
          </p>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referrals.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Awarded</p>
                <p className="text-2xl font-bold">{referrals.filter(r => r.credit_awarded).length}</p>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">€{totalEarned.toFixed(2)}</p>
              </div>
              <Euro className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link to earn €5 for each person who completes their first paid task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 bg-gray-50 rounded border font-mono text-sm">
              {referralCode || "Loading..."}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReferralLink}
              disabled={!referralUrl}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleShareReferralLink}
            disabled={!referralUrl}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">Referral #{referral.id.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={referral.credit_awarded ? "default" : "secondary"}>
                    {referral.credit_awarded ? "€5 Earned" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
