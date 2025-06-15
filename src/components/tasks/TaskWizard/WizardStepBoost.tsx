
import React from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const boostOptions = [
  { label: "None", value: "" },
  { label: "€1 for 8h Boost", value: "8h" },
  { label: "€2.5 for 24h Boost", value: "24h" }
];

export default function WizardStepBoost({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><Rocket className="text-gray-500" /> Boost your task?</label>
      <div className="flex flex-row gap-3">
        {boostOptions.map(opt=>(
          <Button key={opt.value} variant={value===opt.value?"default":"outline"} onClick={()=>onChange(opt.value)}>
            {opt.label}
          </Button>
        ))}
      </div>
      {value && <div className="mt-2 text-sm text-green-600 flex items-center gap-1"><Rocket className="inline" size={15}/> Your task will be boosted ({value})</div>}
    </div>
  );
}
