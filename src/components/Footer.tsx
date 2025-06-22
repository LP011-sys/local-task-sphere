
import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-section w-full bg-white/80 text-center text-body-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} {t("appName")}. 
      <a 
        href="https://docs.lovable.dev/" 
        className="underline hover:text-primary transition-colors ml-1"
      >
        About this app
      </a>
    </footer>
  );
}
