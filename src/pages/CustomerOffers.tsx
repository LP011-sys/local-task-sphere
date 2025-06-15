
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";
import { format, isBefore } from "date-fns";

// --- Mock Data ---
const MOCK_TASKS = [
  {
    id: "t1",
    title: "Mount Bookshelf",
    postedPrice: 45,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    offerDeadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "t2",
    title: "Clean Balcony",
    postedPrice: 25,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    offerDeadline: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  },
];

// Offer statuses: "Pending", "Accepted", "Rejected", "Countered"
const MOCK_OFFERS: Record<string, Array<any>> = {
  t1: [
    {
      id: "o1",
      provider: "Hannah Müller",
      price: 42,
      estimation: "3h",
      rating: 4.5,
      message: "Can do tomorrow afternoon.",
      status: "Pending",
      countered: false,
    },
    {
      id: "o2",
      provider: "Igor P.",
      price: 47,
      estimation: "2.5h",
      rating: 5,
      message: "",
      status: "Pending",
      countered: false,
    },
  ],
  t2: [
    {
      id: "o3",
      provider: "Monique L.",
      price: 25,
      estimation: "1.5h",
      rating: 4,
      message: "Flexible times.",
      status: "Pending",
      countered: false,
    },
  ],
};

export default function CustomerOffers() {
  const [selectedTaskId, setSelectedTaskId] = useState(MOCK_TASKS[0]?.id || "");
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [counterOffer, setCounterOffer] = useState<{ open: boolean; offerId: string | null; provider: string; originalPrice: number; taskId: string }>({ open: false, offerId: null, provider: "", originalPrice: 0, taskId: "" });
  const [counterAmount, setCounterAmount] = useState("");
  const selectedTask = MOCK_TASKS.find((t) => t.id === selectedTaskId);

  const offerDeadlineExpired = !selectedTask || Date.now() > new Date(selectedTask.offerDeadline).getTime();
  const timeLeft = selectedTask ? timeUntilDeadline(selectedTask.offerDeadline) : null;

  const handleAction = (offerId: string, action: "accept" | "reject" | "counter", taskId: string) => {
    setOffers((prev) => {
      const updated = { ...prev };
      updated[taskId] = updated[taskId].map((o: any) => {
        if (o.id !== offerId) return o;
        if (action === "accept") return { ...o, status: "Accepted" };
        if (action === "reject") return { ...o, status: "Rejected" };
        // Counter handled below
        return o;
      });
      return updated;
    });

    if (action === "accept") {
      toast({ title: "Offer accepted!", description: "You have confirmed this provider. The task can now begin." });
    }
    if (action === "reject") {
      toast({ title: "Offer rejected." });
    }
  };

  function handleCounterOpen(offer: any, taskId: string) {
    setCounterAmount("");
    setCounterOffer({
      open: true,
      offerId: offer.id,
      provider: offer.provider,
      originalPrice: offer.price,
      taskId,
    });
  }
  function handleSendCounter() {
    if (!/^\d+(\.\d{1,2})?$/.test(counterAmount) || Number(counterAmount) <= 0) {
      toast({ title: "Please enter a valid counter amount." });
      return;
    }
    setOffers((prev) => {
      const updated = { ...prev };
      updated[counterOffer.taskId] = updated[counterOffer.taskId].map((o: any) => {
        if (o.id !== counterOffer.offerId) return o;
        return { ...o, status: "Countered", countered: true, counterPrice: Number(counterAmount) };
      });
      return updated;
    });
    setCounterOffer({ ...counterOffer, open: false });
    toast({ title: "Counter offer sent!" });
  }

  function offerStatusLabel(status: string) {
    switch (status) {
      case "Pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case "Accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "Countered":
        return <Badge className="bg-yellow-100 text-yellow-800">Countered</Badge>;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="mb-4">
        <Tabs
          value={selectedTaskId}
          onValueChange={setSelectedTaskId}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {MOCK_TASKS.map((task) => (
              <TabsTrigger key={task.id} value={task.id}>
                <span className="font-medium text-sm truncate">{task.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {selectedTask ? (
        <div className="mb-4">
          <Card className="p-4 flex flex-col md:flex-row justify-between gap-3">
            <div>
              <div className="font-semibold">{selectedTask.title}</div>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-3 items-center">
                <span>
                  <span className="font-medium">Posted price:</span> €{selectedTask.postedPrice}
                </span>
                <span>
                  <span className="font-medium">Deadline:</span> {formatDate(selectedTask.deadline)}
                </span>
                <span>
                  <span className="font-medium">Offers:</span> {offers[selectedTask.id]?.length || 0}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {!offerDeadlineExpired ? (
                <span className="text-xs text-green-700 bg-green-100 rounded px-2 py-1 font-medium">
                  {timeLeft
                    ? `You have ${timeLeft} left to accept offers.`
                    : ""}
                </span>
              ) : (
                <span className="text-xs text-red-700 bg-red-100 rounded px-2 py-1 font-medium">
                  Offer period closed. Please repost or create a new task.
                </span>
              )}
            </div>
          </Card>
        </div>
      ) : null}
      {/* OFFERS LIST */}
      <div className="flex flex-col gap-4">
        {(offers[selectedTaskId] || []).map((offer: any) => (
          <Card key={offer.id} className="p-4 flex flex-col md:flex-row justify-between items-start gap-2">
            <div className="flex-grow min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-base">{offer.provider}</span>
                <span className="text-muted-foreground">
                  {offerStatusLabel(offer.status)}
                </span>
              </div>
              <div className="text-sm flex flex-wrap gap-2 items-center mt-1">
                <span>
                  <span className="font-medium">Offer:</span> €{offer.price}
                </span>
                {typeof offer.estimation === "string" && offer.estimation && (
                  <span>
                    <span className="font-medium">Time:</span> {offer.estimation}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: Math.floor(offer.rating) }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  {offer.rating % 1 !== 0 && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="sr-only">{offer.rating}</span>
                </span>
                {offer.message && (
                  <span>
                    <span className="font-medium">Note:</span> {offer.message}
                  </span>
                )}
                {offer.status === "Countered" && offer.counterPrice && (
                  <span>
                    <Badge className="bg-yellow-100 text-yellow-800">Your counter: €{offer.counterPrice}</Badge>
                  </span>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1 mt-2 md:mt-0">
              {!offerDeadlineExpired && offer.status === "Pending" && (
                <>
                  <Button size="sm" onClick={() => handleAction(offer.id, "accept", selectedTaskId)}>
                    Accept Offer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleAction(offer.id, "reject", selectedTaskId)}>
                    Reject Offer
                  </Button>
                  {!offer.countered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCounterOpen(offer, selectedTaskId)}
                    >
                      Counter Offer
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
        {(offers[selectedTaskId] || []).length === 0 && (
          <Card className="p-5 text-center text-muted-foreground">No offers received for this task yet.</Card>
        )}
      </div>
      {/* Counter Offer Modal */}
      <Dialog open={counterOffer.open} onOpenChange={(open) => setCounterOffer({ ...counterOffer, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="mb-2 text-sm">
            Make a counter offer to <span className="font-semibold">{counterOffer.provider}</span>.<br />
            <span>Original Offer: <span className="font-semibold">€{counterOffer.originalPrice}</span></span>
          </div>
          <div className="space-y-2">
            <label className="block text-sm mb-1 font-medium" htmlFor="counter-input">Your Counter Amount (€)</label>
            <input
              type="number"
              min={1}
              value={counterAmount}
              id="counter-input"
              onChange={(e) => setCounterAmount(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base"
              placeholder="Enter counter amount"
            />
            <Button className="w-full mt-2" onClick={handleSendCounter}>Send Counter</Button>
          </div>
        </DialogContent>
      </Dialog>
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
