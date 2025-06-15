
import React from "react";
import { useI18n } from "@/contexts/I18nContext";

const languages = [
  { code: "en", label: "English" },
  { code: "sr", label: "Српски" },
  { code: "ru", label: "Русский" },
];

export default function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("language")}:</span>
      <select
        className="bg-transparent text-base text-foreground border rounded px-2 py-1 outline-none hover-scale"
        value={lang}
        onChange={e => setLang(e.target.value as any)}
      >
        {languages.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
