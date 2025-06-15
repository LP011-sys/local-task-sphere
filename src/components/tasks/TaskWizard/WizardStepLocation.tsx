
import React from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function WizardStepLocation({ value, onChange }: { value: any, onChange: (loc: any) => void }) {
  // For now: only simple lat/lng text and a placeholder
  // VS. Google Maps would require API key, so placeholder box for demo
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><MapPin className="text-gray-500" /> Task Location</label>
      <Input type="text" value={value?.address || ""} placeholder="Enter address or location" onChange={e=>onChange({ ...value, address: e.target.value })} />
      <div className="h-40 bg-blue-50 w-full rounded-xl flex items-center justify-center text-blue-300 border border-blue-100 text-lg">
        [Google Maps pin-drop placeholder]
      </div>
    </div>
  );
}
