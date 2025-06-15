
import React from "react";
import LanguagePicker from "../LanguagePicker";

export default function OnboardingProviderLanguageStep() {
  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-xl font-semibold">Choose your language</h2>
      <LanguagePicker />
    </div>
  );
}
