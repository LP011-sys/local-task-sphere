
import React from "react";
import { Table, Info, CheckCircle, Camera, MapPin, Coins, Rocket, Calendar, Lightbulb, Repeat } from "lucide-react";

export default function WizardStepReview({ form }: { form: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-semibold flex gap-2 items-center text-lg"><Info className="text-blue-400" /> Review your Task</div>
      <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2"><Table size={18} /> <span className="font-bold">Category:</span> <span>{form.category}</span></div>
        <div className="flex items-center gap-2"><Camera size={18}/><span className="font-bold">Description:</span> <span>{form.description}</span></div>
        {form.images?.length>0 && (
          <div className="flex flex-wrap gap-1 pl-6 text-xs text-muted-foreground">
            {form.images.map((img:any,i:number)=>(<span key={i}>{img.name || "File"}</span>))}
          </div>
        )}
        <div className="flex items-center gap-2"><MapPin size={18} /> <span className="font-bold">Location:</span> <span>{form.location?.address}</span></div>
        <div className="flex items-center gap-2"><Coins size={18} /> <span className="font-bold">Type:</span> <span>
          {form.type === "fixed"
            ? `Fixed price: €${form.price}`
            : `Negotiable (initial offer: €${form.offer})`
          }
        </span></div>
        <div className="flex items-center gap-2"><Calendar size={18}/><span className="font-bold">Deadline:</span> <span>{form.deadline}</span></div>
        <div className="flex items-center gap-2"><Calendar size={18}/><span className="font-bold">Offer acceptance by:</span> <span>{form.acceptanceDeadline}</span></div>
        <div className="flex items-center gap-2"><Repeat size={18}/><span className="font-bold">Recurring:</span> <span>{form.recurring ? "Yes" : "No"}</span></div>
        <div className="flex items-center gap-2"><Rocket size={18}/><span className="font-bold">Boost:</span> <span>{form.boost ? form.boost : "None"}</span></div>
        <div className="flex items-center gap-2"><Lightbulb size={18}/><span className="font-bold">Suggested Range:</span> <span>{form.suggestedPrice}</span></div>
      </div>
      <div className="flex gap-2 items-center text-green-600 text-base mt-2"><CheckCircle className="text-green-500" /> Everything looks good? Click "Confirm & Post"!</div>
    </div>
  );
}
