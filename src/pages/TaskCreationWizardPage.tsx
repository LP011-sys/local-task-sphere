
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import TaskWizard from "@/components/tasks/TaskWizard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function TaskCreationWizardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate("/dashboard/customer");
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">{t("postTask")}</h1>
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
    </ErrorBoundary>
  );
}
