
import React from "react";
import { Coins, Handshake } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function WizardStepType({
  value,
  price,
  offer,
  onType,
  onPrice,
  onOffer
}: {
  value: string,
  price: string,
  offer: string,
  onType: (v: string) => void,
  onPrice: (v: string) => void,
  onOffer: (v: string) => void,
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2">Choose task type</label>
      <div className="flex flex-row gap-4">
        <button
          type="button"
          className={`flex items-center gap-1 px-3 py-2 rounded border ${value === "fixed" ? "bg-primary text-white border-primary" : "bg-white border-gray-300 text-gray-600"}`}
          onClick={()=>onType("fixed")}
        >
          <Coins className="mr-1" /> Fixed price
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 px-3 py-2 rounded border ${value === "negotiable" ? "bg-primary text-white border-primary" : "bg-white border-gray-300 text-gray-600"}`}
          onClick={()=>onType("negotiable")}
        >
          <Handshake className="mr-1" /> Negotiable
        </button>
      </div>
      {value === "fixed" ?
        <Input type="number" value={price} onChange={e=>onPrice(e.target.value)} placeholder="Enter the full amount (€)" /> :
        <Input type="number" value={offer} onChange={e=>onOffer(e.target.value)} placeholder="Enter your initial offer (€)" />
      }
    </div>
  );
}
