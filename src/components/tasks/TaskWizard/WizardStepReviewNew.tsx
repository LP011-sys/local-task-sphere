
import React from 'react';
import { Badge } from '@/components/ui/badge';
import TaskBoostBadge from '../TaskBoostBadge';

const BOOST_OPTIONS = [
  { value: "none", label: "No Boost (Free)", price: 0, duration: 0 },
  { value: "8h", label: "Boost for 8 hours (€1)", price: 1, duration: 8 },
  { value: "24h", label: "Boost for 24 hours (€2.5)", price: 2.5, duration: 24 },
];

interface WizardStepReviewNewProps {
  form: {
    title: string;
    category: string;
    description: string;
    location: string;
    budget: string;
    boost: string;
  };
}

export default function WizardStepReviewNew({ form }: WizardStepReviewNewProps) {
  const selectedBoost = BOOST_OPTIONS.find(opt => opt.value === form.boost);
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Review Your Task</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">{form.title}</h4>
          <Badge variant="secondary" className="mt-1">{form.category}</Badge>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{form.description}</p>
        </div>
        
        {form.location && (
          <div>
            <span className="text-sm text-gray-500">Location: </span>
            <span className="text-sm font-medium">{form.location}</span>
          </div>
        )}
        
        <div>
          <span className="text-sm text-gray-500">Budget: </span>
          <span className="text-sm font-medium">€{form.budget}</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-500">Boost: </span>
          <span className="text-sm font-medium">{selectedBoost?.label}</span>
          {selectedBoost && selectedBoost.value !== "none" && (
            <TaskBoostBadge 
              isBoosted={true} 
              boostExpiresAt={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()} 
              className="ml-2"
            />
          )}
        </div>
        
        {selectedBoost && selectedBoost.price > 0 && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium text-primary">
              Total: €{selectedBoost.price} (boost fee)
            </span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        By posting this task, you agree to our terms of service and privacy policy.
      </p>
    </div>
  );
}
