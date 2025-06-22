
import React from 'react';
import { Input } from '@/components/ui/input';

interface WizardStepBudgetProps {
  form: {
    budget: string;
  };
  errors: { [k: string]: string };
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export default function WizardStepBudget({ form, errors, onChange, disabled }: WizardStepBudgetProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Budget</h3>
      
      <div>
        <label className="block font-medium mb-1">
          Budget (€) <span className="text-destructive">*</span>
        </label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={form.budget}
          onChange={e => onChange("budget", e.target.value)}
          placeholder="e.g. 25"
          disabled={disabled}
          className={errors.budget ? "border-destructive" : ""}
        />
        {errors.budget && (
          <div className="text-destructive text-sm mt-1" role="alert">
            {errors.budget}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Set a fair budget that reflects the complexity and time required for your task.
        </p>
      </div>
    </div>
  );
}
