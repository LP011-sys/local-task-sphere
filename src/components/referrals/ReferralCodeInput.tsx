
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { useCreateReferral } from "@/hooks/useReferrals";

interface ReferralCodeInputProps {
  userId: string;
  onSuccess?: () => void;
}

export default function ReferralCodeInput({ userId, onSuccess }: ReferralCodeInputProps) {
  const [referralCode, setReferralCode] = useState("");
  const createReferral = useCreateReferral();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    createReferral.mutate(
      { referralCode: referralCode.toUpperCase(), referredUserId: userId },
      {
        onSuccess: () => {
          setReferralCode("");
          onSuccess?.();
        }
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-600" />
          Have a Referral Code?
        </CardTitle>
        <CardDescription>
          Enter a referral code to earn €5 credit when you complete your first paid task!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="uppercase"
            maxLength={8}
          />
          <Button 
            type="submit" 
            disabled={!referralCode.trim() || createReferral.isPending}
          >
            {createReferral.isPending ? "Applying..." : "Apply"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
