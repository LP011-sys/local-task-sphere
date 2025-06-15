
import React from "react";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";

type EarningsSummaryProps = {
  last7: any[];
  last30: any[];
  pendingPayout: number;
  MOCK_EARNINGS: any[];
  formatDate: (date: string) => string;
};

export default function EarningsSummary({
  last7,
  last30,
  pendingPayout,
  MOCK_EARNINGS,
  formatDate,
}: EarningsSummaryProps) {
  return (
    <>
      <Card className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div>
          <div className="font-bold text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-600" />
            €{last7.reduce((acc, e) => acc + e.net, 0).toFixed(2)} <span className="text-xs text-gray-600 font-normal ml-1">last 7 days</span>
          </div>
          <div className="font-bold text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            €{last30.reduce((acc, e) => acc + e.net, 0).toFixed(2)} <span className="text-xs text-gray-600 font-normal ml-1">last 30 days</span>
          </div>
        </div>
        <div>
          <div className="font-medium">Pending Payouts: <span className="text-primary">€{pendingPayout}</span></div>
          <div className="font-medium">Completed Tasks: <span className="text-primary">{MOCK_EARNINGS.length}</span></div>
        </div>
      </Card>
      <div>
        <div className="font-bold mb-2">Payout Breakdown</div>
        <div className="flex flex-col gap-2">
          {MOCK_EARNINGS.map(e => (
            <Card key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-muted-foreground flex gap-2 items-center">
                  <span>Date: {formatDate(e.date)}</span>
                  <span>Gross: €{e.gross}</span>
                  <span>Fee: €{e.fee}</span>
                  <span>Net: €{e.net}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
