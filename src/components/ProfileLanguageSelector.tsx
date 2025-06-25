
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "sr", name: "Српски (Serbian)", flag: "🇷🇸" },
  { code: "ru", name: "Русский (Russian)", flag: "🇷🇺" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷" },
  { code: "de", name: "Deutsch (German)", flag: "🇩🇪" },
  { code: "it", name: "Italiano (Italian)", flag: "🇮🇹" },
  { code: "pt", name: "Português (Portuguese)", flag: "🇵🇹" },
  { code: "zh", name: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "ar", name: "العربية (Arabic)", flag: "🇸🇦" },
];

interface ProfileLanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ProfileLanguageSelector({ value, onChange, label = "Preferred Language" }: ProfileLanguageSelectorProps) {
  const selectedLanguage = languages.find(lang => lang.code === value);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language">
            {selectedLanguage && (
              <div className="flex items-center gap-2">
                <span>{selectedLanguage.flag}</span>
                <span>{selectedLanguage.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
