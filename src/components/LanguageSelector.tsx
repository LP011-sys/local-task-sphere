
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "sr", name: "Српски", flag: "🇷🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

interface LanguageSelectorProps {
  variant?: "select" | "buttons" | "compact";
  showLabel?: boolean;
}

export default function LanguageSelector({ variant = "select", showLabel = false }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      console.log(`Changing language from ${i18n.language} to ${languageCode}`);
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      setCurrentLang(languageCode);
      console.log(`Language changed successfully to: ${languageCode}`);
      
      // Force a page refresh if needed
      if (i18n.language !== languageCode) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (variant === "buttons") {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {t("language")}:
          </span>
        )}
        <div className="flex gap-1">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLang === lang.code ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLanguageChange(lang.code)}
              className="px-2 py-1 text-xs font-medium"
            >
              {lang.flag} {lang.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-16 h-8 text-xs border-none shadow-none">
          <SelectValue>
            {languages.find(l => l.code === currentLang)?.flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs">
              {lang.flag} {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Globe className="w-4 h-4" />
          {t("language")}:
        </span>
      )}
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
