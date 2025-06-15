
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Localization helpers/types can be added if needed.
type MyOffersListProps = {
  offers: any[];
  cancelOffer: (id: string) => void;
  formatTimeRemaining: (iso: string) => string;
  STATUS_COLORS: Record<string, string>;
};

export default function MyOffersList({ offers, cancelOffer, formatTimeRemaining, STATUS_COLORS }: MyOffersListProps) {
  if (offers.length === 0) {
    return <Card className="p-8 text-center">You haven&apos;t submitted any offers yet.</Card>;
  }
  return (
    <div className="flex flex-col gap-3">
      {offers.map(offer => (
        <Card key={offer.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
          <div>
            <div className="font-semibold">{offer.title}</div>
            <div className="text-sm text-muted-foreground flex gap-2 items-center">
              <span>€{offer.price} offered</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[offer.status]}`}
              >
                {offer.status}
              </span>
              {offer.status === "Pending" && offer.offer_deadline && (
                <span className="ml-2 text-xs text-gray-500">Time left: {formatTimeRemaining(offer.offer_deadline)}</span>
              )}
            </div>
          </div>
          <div>
            {offer.status === "Pending" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => cancelOffer(offer.id)}
              >Cancel Offer</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
