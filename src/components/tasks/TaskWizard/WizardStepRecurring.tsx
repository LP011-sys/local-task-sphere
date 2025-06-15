
import React from "react";
import { Repeat } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function WizardStepRecurring({ value, onChange }: { value: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><Repeat className="text-gray-500" /> Recurring task?</label>
      <div className="flex flex-row items-center gap-3 mt-1">
        <span>No</span>
        <Switch checked={!!value} onCheckedChange={onChange} />
        <span>Yes</span>
      </div>
    </div>
  )
}
