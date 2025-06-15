
import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function WizardStepDeadline({
  deadline,
  acceptanceDeadline,
  onDeadline,
  onAcceptDeadline
}: {
  deadline: string,
  acceptanceDeadline: string,
  onDeadline: (v: string) => void,
  onAcceptDeadline: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><Calendar className="text-gray-500" /> Task Deadlines</label>
      <div className="flex flex-col gap-2">
        <Input type="date" value={deadline} onChange={e=>onDeadline(e.target.value)} placeholder="Deadline" />
        <Input type="datetime-local" value={acceptanceDeadline} onChange={e=>onAcceptDeadline(e.target.value)} placeholder="Latest time for offer acceptance" />
      </div>
    </div>
  );
}
