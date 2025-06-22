
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TaskBoostBadge from '../TaskBoostBadge';

const BOOST_OPTIONS = [
  { value: "none", label: "No Boost (Free)", price: 0, duration: 0 },
  { value: "8h", label: "Boost for 8 hours (€1)", price: 1, duration: 8 },
  { value: "24h", label: "Boost for 24 hours (€2.5)", price: 2.5, duration: 24 },
];

interface WizardStepBoostNewProps {
  form: {
    boost: string;
  };
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export default function WizardStepBoostNew({ form, onChange, disabled }: WizardStepBoostNewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Boost Visibility</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Boost your task to get more visibility and faster responses from providers.
      </p>
      
      <RadioGroup
        value={form.boost}
        onValueChange={val => onChange("boost", val)}
        className="flex flex-col gap-3"
        disabled={disabled}
      >
        {BOOST_OPTIONS.map(opt => (
          <div key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value={opt.value} id={opt.value} />
            <label htmlFor={opt.value} className="text-sm flex items-center gap-2 flex-1 cursor-pointer">
              <span className="font-medium">{opt.label}</span>
              {opt.value !== "none" && (
                <TaskBoostBadge 
                  isBoosted={true} 
                  boostExpiresAt={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()} 
                  className="ml-1"
                />
              )}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
