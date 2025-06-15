
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Info, BadgeEuro, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Mock task data and task fetching
const TASK_CATEGORIES = [
  "Furniture Assembly",
  "Cleaning",
  "Errands",
  "Admin Help",
  "Pet Care",
];

const SORT_OPTIONS = [
  { value: "nearest", label: "Nearest" },
  { value: "highest", label: "Highest Price" },
  { value: "deadline", label: "Soonest Deadline" },
];

const DEADLINE_FILTERS = [
  { value: "all", label: "All" },
  { value: "today", label: "Due Today" },
  { value: "week", label: "Due This Week" },
];

// Utility for date display
function formatDeadline(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Mock provider location (fixed for demo)
const PROVIDER_LAT = 52.52, PROVIDER_LNG = 13.405;

// VERY basic "distance" calculation (actually random for demo)
function mockDistance(): number {
  // Random between 2–30 km
  return 2 + Math.random() * 28;
}

// Example task data (replace with Supabase fetch hook if needed)
const MOCK_TASKS = [
  {
    id: "1",
    title: "Assemble IKEA wardrobe",
    description: "Need an expert to assemble a PAX wardrobe, tools on-site.",
    category: "Furniture Assembly",
    price: 40,
    location: { address: "Alexanderplatz, Berlin", lat: 52.521, lng: 13.409 },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    offer_deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    boost_status: "24h",
    images: [],
    negotiable: false,
  },
  {
    id: "2",
    title: "Clean my kitchen & living room",
    description:
      "Looking for a reliable cleaner for kitchen/living, bring your own materials.",
    category: "Cleaning",
    price: 30,
    location: { address: "Frankfurter Allee 1, Berlin", lat: 52.51, lng: 13.454 },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    offer_deadline: undefined,
    boost_status: "none",
    images: [],
    negotiable: true,
  },
  {
    id: "3",
    title: "Walk my Labrador",
    description: "Daily 30 min walks this week, times flexible.",
    category: "Pet Care",
    price: 15,
    location: { address: "Prenzlauer Allee 10, Berlin", lat: 52.532, lng: 13.439 },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    offer_deadline: undefined,
    boost_status: "8h",
    images: [],
    negotiable: false,
  },
];

export default function ProviderTaskFeed() {
  // Filter state
  const [category, setCategory] = useState<string>("");
  const [distance, setDistance] = useState<number>(10);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nearest");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // For real app, fetch tasks from Supabase here
  const filteredTasks = useMemo(() => {
    let tasks = MOCK_TASKS.map(t => ({ ...t, mockDistance: mockDistance() }));
    if (category) tasks = tasks.filter(t => t.category === category);
    tasks = tasks.filter((t) => t.mockDistance <= distance);
    if (deadlineFilter === "today") {
      const now = new Date();
      const tonight = new Date();
      tonight.setHours(23, 59, 59, 999);
      tasks = tasks.filter(
        t => new Date(t.deadline) >= now && new Date(t.deadline) <= tonight
      );
    }
    if (deadlineFilter === "week") {
      const now = new Date();
      const week = new Date();
      week.setDate(week.getDate() + 7);
      tasks = tasks.filter(
        t => new Date(t.deadline) >= now && new Date(t.deadline) <= week
      );
    }
    tasks.sort((a, b) => {
      switch (sortBy) {
        case "highest":
          return b.price - a.price;
        case "deadline":
          return +new Date(a.deadline) - +new Date(b.deadline);
        case "nearest":
        default:
          return a.mockDistance - b.mockDistance;
      }
    });
    return tasks;
  }, [category, distance, deadlineFilter, sortBy]);

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <h1 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Info className="w-6 h-6 text-primary" /> Find Open Tasks Near You
      </h1>
      <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-4 mb-6 sticky top-2 z-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-medium block mb-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {TASK_CATEGORIES.map(cat => (
                  <SelectItem value={cat} key={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-medium mb-1">Distance</label>
            <div className="flex items-center gap-2">
              <Slider
                min={0}
                max={30}
                step={1}
                value={[distance]}
                onValueChange={v => setDistance(Number(v[0]))}
                className="w-32"
              />
              <span className="ml-2 text-sm font-medium">{distance} km</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Deadline</label>
            <div className="flex rounded-md overflow-hidden border bg-secondary">
              {DEADLINE_FILTERS.map(opt => (
                <button
                  key={opt.value}
                  className={cn(
                    "px-3 py-1 text-sm font-medium transition-colors outline-none",
                    deadlineFilter === opt.value
                      ? "bg-primary text-white"
                      : "hover:bg-accent"
                  )}
                  style={{ borderRight: opt.value !== "week" ? "1px solid #e5e7eb" : undefined }}
                  onClick={() => setDeadlineFilter(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-[120px]">
            <label className="text-sm font-medium block mb-1">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem value={opt.value} key={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Main Section: Task Cards */}
      <div className="flex flex-col gap-4">
        {filteredTasks.length === 0 && (
          <Card className="flex flex-col items-center py-14">
            <div className="text-muted-foreground">No tasks found. Try adjusting your filters.</div>
          </Card>
        )}
        {filteredTasks.map(task => (
          <Card key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 relative">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold">{task.title}</span>
                {task.boost_status && task.boost_status !== "none" && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 flex items-center gap-1 ml-1">
                    <Sparkles className="w-4 h-4" />
                    Boosted Task
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <BadgeEuro className="w-4 h-4" /> €{task.price}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> ~{task.mockDistance.toFixed(1)} km
                </span>
                <span>{task.category}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {formatDeadline(task.deadline)}
                </span>
              </div>
            </div>
            <Button size="sm" className="self-end md:self-center" onClick={() => setSelectedTask(task)}>
              View Details
            </Button>
          </Card>
        ))}
      </div>
      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onOfferSubmit={({ price }) => {
          setSelectedTask(null);
          toast({
            title: "Offer submitted!",
            description: `Your offer (€${price}) was sent to the customer successfully.`,
          });
        }}
      />
    </div>
  );
}

// Modal for viewing and offering on tasks
function TaskDetailsModal({
  task,
  onClose,
  onOfferSubmit,
}: {
  task: any | null;
  onClose: () => void;
  onOfferSubmit: (v: { price: number }) => void;
}) {
  const [open, setOpen] = useState(!!task);
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setOpen(!!task);
    setPrice("");
    setTime("");
    setMsg("");
  }, [task]);

  if (!task) return null;

  // 20% commission
  const priceNum = Number(price);
  const netEarnings = priceNum && priceNum > 0 ? (priceNum * 0.8).toFixed(2) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceNum || priceNum <= 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOfferSubmit({ price: priceNum });
      setOpen(false);
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>
            {task.title}
          </DialogTitle>
          {task.boost_status && task.boost_status !== "none" && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Boosted Task
            </Badge>
          )}
          <DialogDescription>
            <span className="block text-primary font-medium text-lg mb-2">€{task.price}</span>
            <span className="flex items-center gap-1 mb-2 text-muted-foreground">
              <MapPin className="w-4 h-4" /> {task.location?.address} &middot; {formatDeadline(task.deadline)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {/* Task Photos */}
        {task.images?.length > 0 && (
          <div className="flex gap-2 my-2">
            {task.images.map((img: string, idx: number) => (
              <img key={idx} src={img} className="w-20 h-20 object-cover rounded" alt="Task" />
            ))}
          </div>
        )}
        {/* Full Description */}
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-1">Description</div>
          <div className="">{task.description}</div>
        </div>
        <div className="mb-3 text-sm">
          <span className="font-medium">Deadline:</span> {formatDeadline(task.deadline)}
        </div>
        {task.offer_deadline && (
          <div className="mb-2 text-xs text-muted-foreground">
            Last time to make offer: {formatDeadline(task.offer_deadline)} (<OfferDeadlineCountdown to={task.offer_deadline} />)
          </div>
        )}
        {task.negotiable ? (
          <div className="mb-3 text-primary font-medium">Provider may submit counter-offer</div>
        ) : (
          <div className="mb-3 text-muted-foreground text-xs">Price is fixed by customer.</div>
        )}
        {/* Offer Submission */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-medium text-sm block mb-1">Your Price (gross, €)</label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min={1}
              placeholder="Enter your price"
              required
              inputMode="decimal"
            />
            {netEarnings && (
              <div className="text-xs text-muted-foreground mt-1">
                You will earn <span className="font-semibold">€{netEarnings}</span> after commission.
              </div>
            )}
          </div>
          <div>
            <label className="font-medium text-sm block mb-1">Estimated Completion Time (optional)</label>
            <Input
              type="text"
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="e.g., 2 hours"
            />
          </div>
          <div>
            <label className="font-medium text-sm block mb-1">Message to Customer (optional)</label>
            <Textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              maxLength={300}
              placeholder="Say something to stand out..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !priceNum || priceNum <= 0}>
              {loading ? "Submitting..." : "Submit Offer"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OfferDeadlineCountdown({ to }: { to: string }) {
  const [left, setLeft] = useState("");

  React.useEffect(() => {
    function update() {
      const t = Math.max(0, +new Date(to) - Date.now());
      if (t <= 0) return setLeft("0m");
      const h = Math.floor(t / (1000 * 60 * 60));
      const m = Math.floor((t / (1000 * 60)) % 60);
      setLeft(`${h}h ${m}m`);
    }
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, [to]);

  return <span>({left} left)</span>;
}
