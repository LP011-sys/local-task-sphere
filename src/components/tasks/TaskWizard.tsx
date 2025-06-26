
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import WizardStepper from "./TaskWizard/WizardStepper";
import WizardStepBasics from "./TaskWizard/WizardStepBasics";
import WizardStepBudget from "./TaskWizard/WizardStepBudget";
import WizardStepBoostNew from "./TaskWizard/WizardStepBoostNew";
import WizardStepReviewNew from "./TaskWizard/WizardStepReviewNew";

const BOOST_OPTIONS = [
  { value: "none", label: "No Boost (Free)", price: 0, duration: 0 },
  { value: "8h", label: "Boost for 8 hours (€1)", price: 1, duration: 8 },
  { value: "24h", label: "Boost for 24 hours (€2.5)", price: 2.5, duration: 24 },
];

const STEP_LABELS = ["Details", "Budget", "Boost", "Review"];

export default function TaskCreationWizard({ onDone }: { onDone?: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    budget: "",
    boost: "none",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();

  const handleChange = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error on change for immediate feedback
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateStep = useCallback((step: number) => {
    const errs: { [k: string]: string } = {};
    
    if (step === 1) {
      if (!form.title.trim()) errs.title = "Task title is required";
      if (!form.category) errs.category = "Task category is required";
      if (!form.description.trim()) errs.description = "Description is required";
    }
    
    if (step === 2) {
      if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0) {
        errs.budget = "Budget is required and must be a positive number";
      }
    }
    
    return errs;
  }, [form.title, form.category, form.description, form.budget]);

  const currentStepErrors = useMemo(() => validateStep(currentStep), [validateStep, currentStep]);
  const isCurrentStepValid = useMemo(() => Object.keys(currentStepErrors).length === 0, [currentStepErrors]);

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setErrors({});
    } else {
      setErrors(stepErrors);
      toast({ title: "Please fix errors before continuing", variant: "destructive" });
    }
  }, [validateStep, currentStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  }, []);

  const getCompletedSteps = useMemo(() => {
    return [
      Object.keys(validateStep(1)).length === 0,
      Object.keys(validateStep(2)).length === 0,
      true, // Boost step is always valid
      true, // Review step is always valid
    ];
  }, [validateStep]);

  const handleSubmit = useCallback(async () => {
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const allErrors = { ...step1Errors, ...step2Errors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast({ title: "Please fix all errors", variant: "destructive" });
      return;
    }

    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const selectedBoost = BOOST_OPTIONS.find(opt => opt.value === form.boost);
      const boostExpiresAt = selectedBoost && selectedBoost.duration > 0 
        ? new Date(Date.now() + selectedBoost.duration * 60 * 60 * 1000).toISOString()
        : null;

      const payload = {
        user_id: user.id,
        category: form.category,
        description: form.description,
        location: form.location ? form.location : null,
        price: String(form.budget),
        boost_status: form.boost,
        type: "standard",
        offer: form.title,
        boost_expires_at: boostExpiresAt,
        is_boosted: selectedBoost ? selectedBoost.duration > 0 : false,
        boost_duration: selectedBoost ? selectedBoost.duration : 0,
        boost_amount: selectedBoost ? selectedBoost.price : 0,
      };

      const { error } = await supabase.from("Tasks").insert([payload]);
      if (error) throw error;
      
      const boostMessage = selectedBoost && selectedBoost.price > 0 
        ? ` Your task has been boosted for ${selectedBoost.duration} hours!`
        : "";

      toast({ 
        title: "Task posted successfully!", 
        description: `Your task is now live and visible to providers.${boostMessage}` 
      });
      
      if (onDone) onDone();
      
      // Navigate to offers page to see responses
      navigate("/offers");
    } catch (e: any) {
      console.error("Task posting error:", e);
      toast({ title: "Failed to post task", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  }, [validateStep, form, navigate, onDone]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStepBasics
            form={form}
            errors={currentStepErrors}
            onChange={handleChange}
            disabled={posting}
          />
        );
      case 2:
        return (
          <WizardStepBudget
            form={form}
            errors={currentStepErrors}
            onChange={handleChange}
            disabled={posting}
          />
        );
      case 3:
        return (
          <WizardStepBoostNew
            form={form}
            onChange={handleChange}
            disabled={posting}
          />
        );
      case 4:
        return <WizardStepReviewNew form={form} />;
      default:
        return null;
    }
  }, [currentStep, form, currentStepErrors, handleChange, posting]);

  const selectedBoost = useMemo(() => BOOST_OPTIONS.find(opt => opt.value === form.boost), [form.boost]);

  return (
    <div className="max-w-lg w-full mx-auto bg-white border rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-primary text-center mb-6">
        Post a New Task
      </h2>
      
      <WizardStepper
        currentStep={currentStep}
        totalSteps={4}
        stepLabels={STEP_LABELS}
        completedSteps={getCompletedSteps}
      />

      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || posting}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={posting || !isCurrentStepValid}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={posting}
            className="flex items-center gap-2"
          >
            {posting ? "Posting..." : selectedBoost && selectedBoost.price > 0 ? `Post & Pay €${selectedBoost.price}` : "Post Task"}
          </Button>
        )}
      </div>
    </div>
  );
}
