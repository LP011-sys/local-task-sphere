
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  { value: "Cleaning", label: "Cleaning" },
  { value: "Delivery", label: "Delivery" },
  { value: "Repairs", label: "Repairs" },
  { value: "Pet Care", label: "Pet Care" },
  { value: "Tech Help", label: "Tech Help" },
  { value: "Moving", label: "Moving" },
  { value: "Other", label: "Other" },
];

interface WizardStepBasicsProps {
  form: {
    title: string;
    category: string;
    description: string;
    location: string;
  };
  errors: { [k: string]: string };
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export default function WizardStepBasics({ form, errors, onChange, disabled }: WizardStepBasicsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Task Details</h3>
      
      <div>
        <label className="block font-medium mb-1">
          Task Title <span className="text-destructive">*</span>
        </label>
        <Input
          value={form.title}
          onChange={e => onChange("title", e.target.value)}
          placeholder="Briefly describe your task"
          disabled={disabled}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <div className="text-destructive text-sm mt-1" role="alert">
            {errors.title}
          </div>
        )}
      </div>
      
      <div>
        <label className="block font-medium mb-1">
          Category <span className="text-destructive">*</span>
        </label>
        <Select value={form.category} onValueChange={val => onChange("category", val)} disabled={disabled}>
          <SelectTrigger className={errors.category ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <div className="text-destructive text-sm mt-1" role="alert">
            {errors.category}
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">
          Description <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={form.description}
          onChange={e => onChange("description", e.target.value)}
          placeholder="Provide more details about the task, expectations, and timing"
          rows={4}
          disabled={disabled}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <div className="text-destructive text-sm mt-1" role="alert">
            {errors.description}
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Location</label>
        <Input
          value={form.location}
          onChange={e => onChange("location", e.target.value)}
          placeholder="Where is the task located?"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
