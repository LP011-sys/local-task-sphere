
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OnboardingLanguageStep from "../components/onboarding/OnboardingLanguageStep";
import OnboardingSignupStep from "../components/onboarding/OnboardingSignupStep";
import OnboardingCustomerIntroStep from "../components/onboarding/OnboardingCustomerIntroStep";
import OnboardingCustomerProfileStep from "../components/onboarding/OnboardingCustomerProfileStep";

// Added provider steps
import OnboardingProviderLanguageStep from "../components/onboarding/OnboardingProviderLanguageStep";
import OnboardingProviderSignupStep from "../components/onboarding/OnboardingProviderSignupStep";
import OnboardingProviderSkillsStep from "../components/onboarding/OnboardingProviderSkillsStep";
import OnboardingProviderProfileStep from "../components/onboarding/OnboardingProviderProfileStep";
import OnboardingProviderDocumentsStep from "../components/onboarding/OnboardingProviderDocumentsStep";

import { useI18n } from "@/contexts/I18nContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stepsCustomer = [
  { title: "Select Language", component: OnboardingLanguageStep },
  { title: "Sign Up", component: OnboardingSignupStep },
  { title: "Tutorial", component: OnboardingCustomerIntroStep },
  { title: "Profile Setup", component: OnboardingCustomerProfileStep },
];

const stepsProvider = [
  { title: "Select Language", component: OnboardingProviderLanguageStep },
  { title: "Sign Up & Verify", component: OnboardingProviderSignupStep },
  { title: "Select Skills", component: OnboardingProviderSkillsStep },
  { title: "Profile Details", component: OnboardingProviderProfileStep },
  { title: "Upload Documents", component: OnboardingProviderDocumentsStep },
];

export default function OnboardingPage() {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "customer";
  const [step, setStep] = useState(0);
  // Dynamically set steps based on role
  const steps = role === "provider" ? stepsProvider : stepsCustomer;
  const StepComponent = steps[step].component;
  const isLast = step === steps.length - 1;
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
          <h1 className="text-2xl font-bold text-primary">{t("appName")} {role === "customer" && t("customer")}{role === "provider" && t("provider")}</h1>
          <div className="text-muted-foreground text-sm">Step {step + 1}/{steps.length}</div>
        </div>
        <div className="flex-1 mb-4">
          <StepComponent />
        </div>
        <div className="flex gap-4 justify-between pt-2">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
