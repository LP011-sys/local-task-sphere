
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/shared";

type AcceptedTasksListProps = {
  accepted: any[];
  updateTaskStatus: (id: string, next: TaskStatus) => void;
  statusBadge: (status: TaskStatus) => React.ReactNode;
  getPaymentStatus: (taskId: string) => string;
  taskStatusMutation: any;
  formatDate: (date: string) => string;
};

export default function AcceptedTasksList({
  accepted,
  updateTaskStatus,
  statusBadge,
  getPaymentStatus,
  taskStatusMutation,
  formatDate,
}: AcceptedTasksListProps) {
  if (accepted.length === 0) {
    return <Card className="p-8 text-center">You have no tasks in progress.</Card>;
  }
  return (
    <div className="flex flex-col gap-3">
      {accepted.map(task => (
        <Card key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
          <div>
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm text-muted-foreground flex gap-2 items-center">
              <span>
                Deadline: {formatDate(task.deadline)}
              </span>
              {statusBadge(task.status)}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded font-semibold ${
                getPaymentStatus(task.id) === "Prepaid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-800"
              }`
              }>
                {getPaymentStatus(task.id)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {task.status === "open" && (
              <Button
                size="sm"
                onClick={() => updateTaskStatus(task.id, "in_progress")}
                disabled={taskStatusMutation.isPending}
              >
                Mark as Started
              </Button>
            )}
            {task.status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => updateTaskStatus(task.id, "done")}
                disabled={taskStatusMutation.isPending}
              >
                Mark as Done
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
