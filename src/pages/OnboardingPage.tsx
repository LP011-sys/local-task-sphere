
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OnboardingLanguageStep from "../components/onboarding/OnboardingLanguageStep";
import OnboardingSignupStep from "../components/onboarding/OnboardingSignupStep";
import OnboardingCustomerIntroStep from "../components/onboarding/OnboardingCustomerIntroStep";
import OnboardingCustomerProfileStep from "../components/onboarding/OnboardingCustomerProfileStep";
import { useI18n } from "@/contexts/I18nContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stepsCustomer = [
  { title: "Select Language", component: OnboardingLanguageStep },
  { title: "Sign Up", component: OnboardingSignupStep },
  { title: "Tutorial", component: OnboardingCustomerIntroStep },
  { title: "Profile Setup", component: OnboardingCustomerProfileStep },
];

export default function OnboardingPage() {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "customer";
  const [step, setStep] = useState(0);
  const StepComponent = stepsCustomer[step].component;
  const isLast = step === stepsCustomer.length - 1;
  const { t } = useI18n();
  const navigate = useNavigate();

  function handleNext() {
    if (!isLast) setStep(s => s + 1);
    else navigate("/");
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
    else navigate("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100">
      <Card className="max-w-lg w-full p-6 shadow-2xl rounded-xl bg-white space-y-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-primary">{t("appName")} {role === "customer" && t("customer")}</h1>
          <div className="text-muted-foreground text-sm">Step {step + 1}/{stepsCustomer.length}</div>
        </div>
        <div className="flex-1 mb-4">
          <StepComponent />
        </div>
        <div className="flex gap-4 justify-between pt-2">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            {t("Back") || "Back"}
          </Button>
          <Button onClick={handleNext}>
            {isLast ? (t("Finish") || "Finish") : (t("Next") || "Next")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
