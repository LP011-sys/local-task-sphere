import React, { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ArrowRight, Repeat2, Wallet, Calendar, Coins } from "lucide-react";
import { format } from "date-fns";
import { useTaskStatusMutation } from "@/hooks/useTaskStatusMutation";
import { formatDate, formatTimeRemaining } from "@/lib/format";
import { TaskStatus } from "@/types/shared";
import MyOffersList from "./ProviderDashboard/MyOffersList";
import AcceptedTasksList from "./ProviderDashboard/AcceptedTasksList";
import CompletedTasksList from "./ProviderDashboard/CompletedTasksList";
import EarningsSummary from "./ProviderDashboard/EarningsSummary";
import { useProviderTasks } from "@/hooks/useProviderTasks";
import { Loader2 } from "lucide-react";

// --------- MOCK DATA ---------
const MOCK_OFFERS = [
  {
    id: "offer-1",
    title: "Assemble IKEA wardrobe",
    price: 40,
    status: "Pending" as "Pending" | "Declined" | "Expired",
    offer_deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "offer-2",
    title: "Clean my kitchen & living room",
    price: 30,
    status: "Declined" as "Pending" | "Declined" | "Expired",
    offer_deadline: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "offer-3",
    title: "Walk my Labrador",
    price: 18,
    status: "Expired" as "Pending" | "Declined" | "Expired",
    offer_deadline: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

// ALL STATUSES BELOW NOW MATCH BACKEND/DB FORMAT
const MOCK_ACCEPTED_TASKS: {
  id: string;
  title: string;
  deadline: string;
  status: TaskStatus;
}[] = [
  {
    id: "t1",
    title: "Mount curtain rod",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    status: "open",
  },
  {
    id: "t2",
    title: "Build bookshelf",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    status: "in_progress",
  },
];

const MOCK_COMPLETED_TASKS = [
  {
    id: "c1",
    title: "Assemble PAX wardrobe",
    net: 32,
    rating: 5,
    completed: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    customer: "Anna S.",
  },
  {
    id: "c2",
    title: "Weekly pet walk",
    net: 11.2,
    rating: 4,
    completed: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    customer: "Leo G.",
  },
];

const MOCK_EARNINGS = [
  {
    id: "e1",
    title: "Assemble PAX wardrobe",
    date: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    gross: 40,
    fee: 8,
    net: 32,
  },
  {
    id: "e2",
    title: "Weekly pet walk",
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    gross: 14,
    fee: 2.8,
    net: 11.2,
  },
];
// Calculate summary for Earnings tab
const now = new Date();
const last7 = MOCK_EARNINGS.filter(e =>
  new Date(e.date) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
);
const last30 = MOCK_EARNINGS.filter(e =>
  new Date(e.date) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
);
const PENDING_PAYOUT = 12.5; // Static mock

const STATUS_COLORS: Record<string, string> = {
  "Pending": "bg-blue-100 text-blue-800",
  "Declined": "bg-red-100 text-red-800",
  "Expired": "bg-gray-100 text-gray-700",
  "open": "bg-yellow-100 text-yellow-800",
  "in_progress": "bg-blue-100 text-blue-800",
  "done": "bg-blue-200 text-blue-900",
  "completed": "bg-green-100 text-green-800",
  "cancelled": "bg-red-100 text-red-800",
};

export default function ProviderDashboard() {
  const [tab, setTab] = useState("offers");
  const { data: openTasks, isLoading } = useProviderTasks(undefined, "open");

  const [offers, setOffers] = useState(MOCK_OFFERS);
  // accepted status now matches backend
  const [accepted, setAccepted] = useState(MOCK_ACCEPTED_TASKS);
  const [completed, setCompleted] = useState(MOCK_COMPLETED_TASKS);

  const taskStatusMutation = useTaskStatusMutation();

  // Fix: Restrict input to mutation function to only accepted values
  async function updateTaskStatus(
    id: string,
    next: "in_progress" | "done" | "completed" | "cancelled"
  ) {
    try {
      await taskStatusMutation.mutateAsync({ taskId: id, status: next });
      setAccepted(acc =>
        acc.map(t =>
          t.id === id ? { ...t, status: next } : t
        )
      );
      if (next === "completed") {
        const found = accepted.find(t => t.id === id);
        if (found) {
          setCompleted(comp => [
            {
              id: found.id,
              title: found.title,
              net: 24, // Mock net value
              rating: 5, // Mock rating
              completed: new Date().toISOString(),
              customer: "Rebookable Customer",
            },
            ...comp,
          ]);
          toast({ title: "Task marked as completed!", description: "Awaiting customer confirmation." });
        }
      } else if (next === "done") {
        toast({ title: "Marked as done!", description: "Waiting for customer confirmation." });
      } else if (next === "in_progress") {
        toast({ title: "Task started." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  // For My Offers
  function cancelOffer(id: string) {
    setOffers(offers =>
      offers.map(o =>
        o.id === id
          ? { ...o, status: "Declined" }
          : o
      )
    );
    toast({ title: "Offer cancelled." });
  }

  // For payment status display:
  function getPaymentStatus(taskId: string) {
    // This would use a hook in real implementation; here is just a stub for display:
    // You would fetch the payment object from useTaskPayments and show .status
    // For demo, randomly determine "Prepaid" or "Pending Payment"
    return Math.random() > 0.5 ? "Prepaid" : "Pending Payment";
  }

  function statusBadge(status: TaskStatus) {
    switch (status) {
      case "open":
        return <Badge className="bg-gray-100 text-gray-900">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-200 text-yellow-900">In Progress</Badge>;
      case "done":
        return <Badge className="bg-blue-100 text-blue-900">Marked Done</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  }

  // PROVIDER TASK FEED — replaces previous mock/AcceptedTasksList
  function renderTaskFeed() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-80">
          <Loader2 className="animate-spin w-10 h-10 text-muted-foreground" />
        </div>
      );
    }
    if (!openTasks || openTasks.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-md p-8 border text-center text-muted-foreground">
          No tasks available at this time.
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {openTasks.map((t: any) => (
          <div
            key={t.id}
            className={`bg-white rounded-xl shadow-md p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-3
            ${t.boost_status === "24h"
              ? "border-2 border-yellow-400 ring-2 ring-yellow-300"
              : t.boost_status === "8h"
              ? "border-2 border-blue-400 ring-2 ring-blue-300"
              : ""}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg truncate">{t.offer || t.description}</span>
                {(t.boost_status === "24h" || t.boost_status === "8h") && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 ml-2`}>
                    {t.boost_status === "24h" ? "🔥 24h Boost" : "⚡ 8h Boost"}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                Category: <span className="font-medium">{t.category}</span>
                {t.deadline && (
                  <> | Deadline: <span>{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</span></>
                )}
              </div>
              <div className="text-sm text-primary font-medium">
                {t.price ? <>Budget: <span className="font-semibold">€{t.price}</span></> : "Budget: —"}
              </div>
            </div>
            <Button
              className="min-w-[120px] w-full sm:w-auto mt-2 sm:mt-0"
              onClick={() => alert("Offer modal not implemented in this demo.")}
              variant="default"
            >
              Make Offer
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold mb-6">Provider Dashboard</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="offers"><ArrowRight className="mr-1 w-4 h-4" /> My Offers</TabsTrigger>
          <TabsTrigger value="accepted"><Calendar className="mr-1 w-4 h-4" /> Accepted Tasks</TabsTrigger>
          <TabsTrigger value="completed"><Star className="mr-1 w-4 h-4" /> Completed</TabsTrigger>
          <TabsTrigger value="earnings"><Wallet className="mr-1 w-4 h-4" /> Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="offers">
          <div>
            <h2 className="text-lg font-semibold mb-3">Tasks available</h2>
            {renderTaskFeed()}
          </div>
        </TabsContent>

        <TabsContent value="accepted">
          <AcceptedTasksList
            accepted={accepted}
            updateTaskStatus={updateTaskStatus}
            statusBadge={statusBadge}
            getPaymentStatus={getPaymentStatus}
            taskStatusMutation={taskStatusMutation}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedTasksList completed={completed} formatDate={formatDate} />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsSummary
            last7={last7}
            last30={last30}
            pendingPayout={PENDING_PAYOUT}
            MOCK_EARNINGS={MOCK_EARNINGS}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
