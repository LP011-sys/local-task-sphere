
import React from "react";
import TaskWizard from "@/components/tasks/TaskWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskCreationWizardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Post a New Task</h1>
        <p className="text-muted-foreground">
          Tell us what you need help with and get offers from qualified providers
        </p>
      </div>

      {/* Task Creation Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Provide clear details about your task to attract the right providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskWizard />
        </CardContent>
      </Card>
    </div>
  );
}
