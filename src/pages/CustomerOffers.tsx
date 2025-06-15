import React, { useState } from "react";
import { useCustomerTaskOffers, useUpdateOfferStatus } from "@/hooks/useCustomerTaskOffers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useTaskStatusMutation } from "@/hooks/useTaskStatusMutation";

// Utility to format provider name fallback
function formatProviderName(offer: any) {
  return offer?.provider?.name || "Provider";
}

export default function CustomerOffers() {
  // Loading and data error
  const { data: tasks, isLoading, isError, error } = useCustomerTaskOffers();
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const updateStatus = useUpdateOfferStatus();
  const taskStatusMutation = useTaskStatusMutation();

  // Handlers for expand/collapse
  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Accept or Reject offer (update task.status to in_progress on accept)
  const handleOfferAction = async (
    offerId: string,
    action: "accepted" | "rejected",
    taskId?: string
  ) => {
    try {
      await updateStatus.mutateAsync({ offerId, status: action });
      if (action === "accepted" && taskId) {
        await taskStatusMutation.mutateAsync({ taskId, status: "in_progress" });
      }
      toast({
        title:
          action === "accepted"
            ? "Offer accepted!"
            : "Offer rejected.",
        description:
          action === "accepted"
            ? "You have accepted this provider's offer."
            : "You have rejected this provider's offer.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Unable to update offer status.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Tasks & Provider Offers</h1>
      {isLoading && (
        <Card className="mb-2 text-center">
          <div className="animate-pulse py-8 text-muted-foreground">
            Loading your tasks and offers...
          </div>
        </Card>
      )}
      {isError && (
        <Card className="mb-2 text-center bg-red-50 border border-red-200">
          <div className="py-8 text-red-700 font-medium">{String(error)}</div>
        </Card>
      )}
      {!isLoading && !isError && (!tasks || tasks.length === 0) && (
        <Card className="mb-2 text-center text-muted-foreground">
          <div className="py-8">You have not posted any tasks yet.</div>
        </Card>
      )}
      {/* Main task/offer list */}
      {!isLoading &&
        tasks &&
        tasks.length > 0 &&
        tasks.map((task) => (
          <Card key={task.id} className="mb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(task.id)}
            >
              <div>
                <div className="font-semibold text-base">{task.description}</div>
                <div className="text-sm text-muted-foreground">
                  Category: <span className="font-medium">{task.category}</span>
                  {task.deadline && (
                    <>
                      {" "}
                      | Deadline:{" "}
                      <span className="font-medium">
                        {format(new Date(task.deadline), "dd MMM yyyy, HH:mm")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Expand offers"
                  tabIndex={-1}
                  type="button"
                >
                  {expandedTaskIds.includes(task.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
            {/* Offers list */}
            {expandedTaskIds.includes(task.id) && (
              <div className="mt-4">
                {task.offers.length === 0 ? (
                  <div className="text-muted-foreground text-center py-4">
                    No offers received for this task.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {task.offers.map((offer) => (
                      <Card
                        key={offer.id}
                        className="p-4 flex flex-col md:flex-row justify-between items-start gap-2"
                      >
                        {/* Provider info */}
                        <div className="min-w-0">
                          <div className="font-medium text-base mb-1">
                            {formatProviderName(offer)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {offer.created_at
                              ? `Offered on ${format(
                                  new Date(offer.created_at),
                                  "dd MMM yyyy, HH:mm"
                                )}`
                              : ""}
                          </div>
                          <div className="mb-1">
                            {offer.message && (
                              <span>
                                <span className="font-semibold">Message: </span>
                                {offer.message}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold">
                            Offer:{" "}
                            {offer.price
                              ? `€${offer.price}`
                              : "Accepts posted budget"}
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-col gap-2">
                          <span
                            className={`rounded px-3 py-1 text-xs font-semibold ${
                              offer.status === "pending"
                                ? "bg-blue-100 text-blue-800"
                                : offer.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : offer.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }`}
                          >
                            {offer.status.charAt(0).toUpperCase() +
                              offer.status.slice(1)}
                          </span>
                          {offer.status === "pending" && (
                            <div className="flex gap-1 mt-1">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleOfferAction(offer.id, "accepted", offer.task_id)
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleOfferAction(offer.id, "rejected", offer.task_id)
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
    </div>
  );
}

// ----- Utilities -----
function formatDate(date: string) {
  try {
    return format(new Date(date), "dd MMM yyyy, HH:mm");
  } catch {
    return date;
  }
}
function timeUntilDeadline(iso: string) {
  const deadline = new Date(iso).getTime();
  const now = Date.now();
  if (now > deadline) return null;
  const mins = Math.floor((deadline - now) / (1000 * 60));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
