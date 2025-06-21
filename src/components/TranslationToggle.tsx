
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";

interface TranslationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  showDifferentLanguages: boolean;
}

export function TranslationToggle({ enabled, onToggle, showDifferentLanguages }: TranslationToggleProps) {
  if (!showDifferentLanguages) return null;

  return (
    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md border border-blue-200">
      <Languages className="text-blue-600" size={16} />
      <Label htmlFor="translation-toggle" className="text-sm text-blue-700">
        Auto-translate messages
      </Label>
      <Switch
        id="translation-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
