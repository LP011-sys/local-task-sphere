
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const categories = [
  "Cleaning",
  "Gardening",
  "DIY & Repairs",
  "Moving Help",
  "Grocery Shopping",
  "Dog Walking",
  "Tech Support",
  "Other"
];

export default function WizardStepCategory({ value, onChange }: { value: string | null, onChange: (cat: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><Search className="text-gray-500" /> Select a category</label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Search or select a category..." />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
