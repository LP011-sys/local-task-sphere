
import React, { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

// Dummy price suggestion logic based on category
const suggestions: { [cat: string]: string } = {
  "Cleaning": "€20 – €40",
  "Gardening": "€25 – €60",
  "DIY & Repairs": "€30 – €100",
  "Moving Help": "€30 – €80",
  "Grocery Shopping": "€10 – €25",
  "Dog Walking": "€8 – €15",
  "Tech Support": "€15 – €50",
  "Other": "Varies"
};

export default function WizardStepPriceSuggestion({ category, onSuggest }: { category: string, onSuggest: (v: string) => void }) {
  const [suggested, setSuggested] = useState<string>("");

  useEffect(() => {
    const s = category ? suggestions[category] || "N/A" : "N/A";
    setSuggested(s);
    onSuggest(s);
  }, [category]);

  return (
    <div className="flex flex-col gap-4 items-start">
      <span className="font-semibold flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Suggested Price Range</span>
      <div className="rounded-md border bg-yellow-50 text-yellow-700 px-4 py-2 text-base">{suggested}</div>
      <div className="text-xs text-muted-foreground mt-2">Based on this category and similar tasks posted in your area.</div>
    </div>
  )
}
