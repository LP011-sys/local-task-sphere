
import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  completedSteps: boolean[];
}

export default function WizardStepper({ currentStep, totalSteps, stepLabels, completedSteps }: WizardStepperProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps[index];
          const isCurrent = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted || isPast
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted || isPast ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-16 truncate">
                  {stepLabels[index]}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    isPast || isCompleted ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
