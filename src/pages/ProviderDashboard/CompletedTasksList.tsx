
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Repeat2 } from "lucide-react";

type CompletedTasksListProps = {
  completed: any[];
  formatDate: (date: string) => string;
};

export default function CompletedTasksList({ completed, formatDate }: CompletedTasksListProps) {
  if (completed.length === 0) {
    return <Card className="p-8 text-center">You haven&apos;t completed any tasks yet.</Card>;
  }
  return (
    <div className="flex flex-col gap-3">
      {completed.map(task => (
        <Card key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
          <div>
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm text-muted-foreground flex gap-2 items-center">
              <span>Net Earned: €{task.net}</span>
              <span className="flex items-center gap-1">
                {[...Array(task.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </span>
              <span>
                Completed: {formatDate(task.completed)}
              </span>
            </div>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Repeat2 className="w-4 h-4" /> Rebook Customer
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
