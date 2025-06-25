
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLoyaltyTier, getNextTierInfo, getPlatformFeeDiscount, LOYALTY_TIERS } from "@/hooks/useLoyaltyTier";

interface LoyaltyTierCardProps {
  tasksCompleted: number;
}

export function LoyaltyTierCard({ tasksCompleted }: LoyaltyTierCardProps) {
  const currentTier = getLoyaltyTier(tasksCompleted);
  const discount = getPlatformFeeDiscount(currentTier);
  const nextTierInfo = getNextTierInfo(tasksCompleted);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Tier</CardTitle>
        <CardDescription>Your current loyalty status and benefits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">You are currently at</span>
            <Badge variant="default" className="text-sm font-semibold">
              {currentTier}
            </Badge>
            <span className="text-lg">tier.</span>
          </div>
          <p className="text-muted-foreground">
            Platform fee discount: <strong>{discount * 100}%</strong>
          </p>
        </div>

        {/* Progress to Next Tier */}
        {nextTierInfo.nextTier && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              You have completed {tasksCompleted} tasks. {nextTierInfo.tasksNeeded} more to reach {nextTierInfo.nextTier}.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentTier}</span>
                <span>{nextTierInfo.nextTier}</span>
              </div>
              <Progress value={nextTierInfo.progress} className="h-2" />
            </div>
          </div>
        )}

        {tasksCompleted >= 15 && (
          <div className="text-sm text-muted-foreground">
            🎉 Congratulations! You've reached the highest tier.
          </div>
        )}

        {/* Loyalty Tiers Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-base">Loyalty Tiers:</h4>
          
          {Object.entries(LOYALTY_TIERS).map(([tier, info]) => (
            <div 
              key={tier}
              className={`p-3 rounded-lg border ${
                tier === currentTier 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{tier}</span>
                <span className="text-xs text-muted-foreground">({info.range}):</span>
                {tier === currentTier && (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                )}
              </div>
              <ul className="space-y-1">
                {info.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="mr-2">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
