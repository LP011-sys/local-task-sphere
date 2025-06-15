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

const MOCK_ACCEPTED_TASKS = [
  {
    id: "t1",
    title: "Mount curtain rod",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    status: "Not Started" as "Not Started" | "In Progress" | "Completed",
  },
  {
    id: "t2",
    title: "Build bookshelf",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    status: "In Progress" as "Not Started" | "In Progress" | "Completed",
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
  "Not Started": "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Completed": "bg-green-100 text-green-800",
};

// ----------------------------

export default function ProviderDashboard() {
  const [tab, setTab] = useState("offers");
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [accepted, setAccepted] = useState(MOCK_ACCEPTED_TASKS);
  const [completed, setCompleted] = useState(MOCK_COMPLETED_TASKS);

  const taskStatusMutation = useTaskStatusMutation();

  // For Accepted Tasks: now trigger mutation for status
  async function updateTaskStatus(id: string, next: "in_progress" | "done" | "completed") {
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

  function statusBadge(status: string) {
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

  return (
    <div className="max-w-3xl mx-auto px-2 py-4">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="offers"><ArrowRight className="mr-1 w-4 h-4" /> My Offers</TabsTrigger>
          <TabsTrigger value="accepted"><Calendar className="mr-1 w-4 h-4" /> Accepted Tasks</TabsTrigger>
          <TabsTrigger value="completed"><Star className="mr-1 w-4 h-4" /> Completed</TabsTrigger>
          <TabsTrigger value="earnings"><Wallet className="mr-1 w-4 h-4" /> Earnings</TabsTrigger>
        </TabsList>

        {/* ---- My Offers ---- */}
        <TabsContent value="offers">
          {offers.length === 0 && (
            <Card className="p-8 text-center">You haven&apos;t submitted any offers yet.</Card>
          )}
          <div className="flex flex-col gap-3">
            {offers.map(offer => (
              <Card key={offer.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
                <div>
                  <div className="font-semibold">{offer.title}</div>
                  <div className="text-sm text-muted-foreground flex gap-2 items-center">
                    <span>€{offer.price} offered</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[offer.status]}`}
                    >
                      {offer.status}
                    </span>
                    {offer.status === "Pending" && offer.offer_deadline && (
                      <span className="ml-2 text-xs text-gray-500">Time left: {formatTimeRemaining(offer.offer_deadline)}</span>
                    )}
                  </div>
                </div>
                <div>
                  {offer.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelOffer(offer.id)}
                    >Cancel Offer</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- Accepted Tasks ---- */}
        <TabsContent value="accepted">
          {accepted.length === 0 && (
            <Card className="p-8 text-center">You have no tasks in progress.</Card>
          )}
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
                  {task.status === "Not Started" && (
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
        </TabsContent>

        {/* ---- Completed Tasks ---- */}
        <TabsContent value="completed">
          {completed.length === 0 && (
            <Card className="p-8 text-center">You haven&apos;t completed any tasks yet.</Card>
          )}
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
        </TabsContent>

        {/* ---- Earnings ---- */}
        <TabsContent value="earnings">
          <Card className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div>
              <div className="font-bold text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-600" />
                €{last7.reduce((acc, e) => acc + e.net, 0).toFixed(2)} <span className="text-xs text-gray-600 font-normal ml-1">last 7 days</span>
              </div>
              <div className="font-bold text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                €{last30.reduce((acc, e) => acc + e.net, 0).toFixed(2)} <span className="text-xs text-gray-600 font-normal ml-1">last 30 days</span>
              </div>
            </div>
            <div>
              <div className="font-medium">Pending Payouts: <span className="text-primary">€{PENDING_PAYOUT}</span></div>
              <div className="font-medium">Completed Tasks: <span className="text-primary">{MOCK_EARNINGS.length}</span></div>
            </div>
          </Card>
          <div>
            <div className="font-bold mb-2">Payout Breakdown</div>
            <div className="flex flex-col gap-2">
              {MOCK_EARNINGS.map(e => (
                <Card key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4">
                  <div>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-muted-foreground flex gap-2 items-center">
                      <span>Date: {formatDate(e.date)}</span>
                      <span>Gross: €{e.gross}</span>
                      <span>Fee: €{e.fee}</span>
                      <span>Net: €{e.net}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- UTILITIES ---

function formatDate(date: string) {
  try {
    return format(new Date(date), "dd MMM yyyy, HH:mm");
  } catch {
    return date;
  }
}
function formatTimeRemaining(iso: string) {
  const deadline = new Date(iso).getTime();
  const now = Date.now();
  if (now > deadline) return "Expired";
  const mins = Math.floor((deadline - now) / (1000 * 60));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
