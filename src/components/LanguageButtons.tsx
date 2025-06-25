
import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", label: "EN" },
  { code: "sr", label: "SR" },
  { code: "ru", label: "RU" },
];

interface LanguageButtonsProps {
  compact?: boolean;
}

export default function LanguageButtons({ compact = false }: LanguageButtonsProps) {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {languages.map(l => (
        <Button
          key={l.code}
          variant={lang === l.code ? "default" : "ghost"}
          size={compact ? "sm" : "default"}
          onClick={() => setLang(l.code as any)}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            lang === l.code 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
