
import React, { useState } from "react";
import WizardStepCategory from "./TaskWizard/WizardStepCategory";
import WizardStepDescription from "./TaskWizard/WizardStepDescription";
import WizardStepLocation from "./TaskWizard/WizardStepLocation";
import WizardStepType from "./TaskWizard/WizardStepType";
import WizardStepDeadline from "./TaskWizard/WizardStepDeadline";
import WizardStepRecurring from "./TaskWizard/WizardStepRecurring";
import WizardStepBoost from "./TaskWizard/WizardStepBoost";
import WizardStepPriceSuggestion from "./TaskWizard/WizardStepPriceSuggestion";
import WizardStepReview from "./TaskWizard/WizardStepReview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Simple hardcoded step list for navigation
const steps = [
  { name: "Category", key: "category" },
  { name: "Description", key: "description" },
  { name: "Location", key: "location" },
  { name: "Type", key: "type" },
  { name: "Deadline", key: "deadline" },
  { name: "Recurring", key: "recurring" },
  { name: "Boost", key: "boost" },
  { name: "Suggestion", key: "suggestion" },
  { name: "Review", key: "review" }
];

export default function TaskWizard({ onDone }: { onDone?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  // The main wizard state
  const [form, setForm] = useState<any>({
    category: null,
    description: "",
    images: [],
    location: null,
    type: "fixed",
    price: "",
    offer: "",
    deadline: "",
    acceptanceDeadline: "",
    recurring: false,
    boost: "",
    suggestedPrice: "",
  });
  const [posting, setPosting] = useState(false);

  // Handle state changes from steps
  function mergeForm(changes: any) {
    setForm((f: any) => ({ ...f, ...changes }));
  }

  // Wizard step render
  let StepComponent = null;
  switch (currentStep) {
    case 0:
      StepComponent = <WizardStepCategory value={form.category} onChange={cat => mergeForm({ category: cat })} />;
      break;
    case 1:
      StepComponent = <WizardStepDescription
        value={form.description}
        images={form.images}
        onChange={desc => mergeForm({ description: desc })}
        onImages={imgs => mergeForm({ images: imgs })}
      />;
      break;
    case 2:
      StepComponent = <WizardStepLocation value={form.location} onChange={loc => mergeForm({ location: loc })} />;
      break;
    case 3:
      StepComponent = <WizardStepType
        value={form.type}
        price={form.price}
        offer={form.offer}
        onType={t => mergeForm({ type: t })}
        onPrice={p => mergeForm({ price: p })}
        onOffer={o => mergeForm({ offer: o })}
      />;
      break;
    case 4:
      StepComponent = <WizardStepDeadline
        deadline={form.deadline}
        acceptanceDeadline={form.acceptanceDeadline}
        onDeadline={d => mergeForm({ deadline: d })}
        onAcceptDeadline={ad => mergeForm({ acceptanceDeadline: ad })}
      />;
      break;
    case 5:
      StepComponent = <WizardStepRecurring value={form.recurring} onChange={rec => mergeForm({ recurring: rec })} />;
      break;
    case 6:
      StepComponent = <WizardStepBoost value={form.boost} onChange={b => mergeForm({ boost: b })} />;
      break;
    case 7:
      StepComponent = <WizardStepPriceSuggestion category={form.category} onSuggest={sp => mergeForm({ suggestedPrice: sp })} />;
      break;
    case 8:
      StepComponent = <WizardStepReview form={form} />;
      break;
    default:
      StepComponent = null;
  }

  // Submission logic
  async function handlePost() {
    setPosting(true);
    // TODO: Validation
    try {
      // Prepare data (Supabase table: 'Tasks', boost status in 'boostStatus')
      const { category, description, images, location, type, price, offer, deadline, acceptanceDeadline, recurring, boost } = form;
      const { error } = await supabase.from("Tasks").insert([{
        category,
        description,
        images,
        location,
        type,
        price: type === "fixed" ? price : offer,
        deadline,
        acceptance_deadline: acceptanceDeadline,
        recurring,
        boostStatus: boost
      }]);
      if (error) throw error;
      toast({ title: "Task posted!", description: "Your task is now live." });
      if (onDone) onDone();
    } catch (e: any) {
      toast({ title: "Failed to post", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto bg-white border rounded-xl shadow-md p-4 flex flex-col gap-4">
      <ProgressStepper current={currentStep} steps={steps} />

      <div className="min-h-[270px] pt-2">
        {StepComponent}
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <Button variant="outline" disabled={currentStep === 0 || posting} onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}>Back</Button>
        {currentStep < steps.length - 1 ?
          <Button disabled={posting} onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}>Next</Button> :
          <Button disabled={posting} onClick={handlePost}>Confirm & Post</Button>
        }
      </div>
    </div>
  );
}

// Simple horizontal progress stepper for top of wizard
function ProgressStepper({ current, steps }: { current: number, steps: any[] }) {
  return (
    <div className="flex items-center gap-1 mb-2 px-2">
      {steps.map((s, idx) => (
        <React.Fragment key={s.key}>
          <div className={cn(
            "grow text-xs text-center px-1 py-1 rounded-full transition",
            idx === current ? "bg-primary text-primary-foreground font-bold" : "bg-gray-100 text-gray-400"
          )}>{s.name}</div>
          {idx < steps.length - 1 && <span className="w-1 h-1 mx-1 bg-gray-300 rounded-full inline-block" />}
        </React.Fragment>
      ))}
    </div>
  );
}
