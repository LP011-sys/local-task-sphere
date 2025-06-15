
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import ReviewForm from "@/components/ReviewForm";
import { Card } from "@/components/ui/card";

export default function LeaveReviewPage() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("task_id");
  const reviewedUserId = searchParams.get("reviewed_user_id");
  const taskTitle = searchParams.get("task_title"); // optional for summary

  if (!taskId || !reviewedUserId) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <Card className="p-8 text-center">
          Error: Missing review parameters. Please use the correct review link.
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card className="p-6">
        <h1 className="font-bold text-2xl mb-2">Leave a review</h1>
        {taskTitle && (
          <div className="text-muted-foreground mb-2">
            For: <span className="font-medium">{taskTitle}</span>
          </div>
        )}
        <ReviewForm
          taskId={taskId}
          reviewedUserId={reviewedUserId}
          onSuccess={() => {
            toast({ title: "Thank you for your review!" });
            // Optionally redirect after submission
          }}
        />
      </Card>
    </div>
  );
}
