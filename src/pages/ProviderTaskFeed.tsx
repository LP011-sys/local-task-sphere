import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, BadgeEuro, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useProviderTasks } from "@/hooks/useProviderTasks";

// Category options (match with task creation!)
const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "Cleaning", label: "Cleaning" },
  { value: "Delivery", label: "Delivery" },
  { value: "Repairs", label: "Repairs" },
  { value: "Pet Care", label: "Pet Care" },
  { value: "Tech Help", label: "Tech Help" },
  { value: "Moving", label: "Moving" },
  { value: "Other", label: "Other" },
];

// Utility for date display
function formatDeadline(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProviderTaskFeed() {
  // Filter state
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // FIX: Only pass userId to useProviderTasks, remove extra filter logic
  // It's not implemented here (left as prior), so just pass undefined to simulate no filtering
  const { data: tasks, isLoading, refetch, error } = useProviderTasks(undefined);

  return (
    <div className="max-w-3xl mx-auto px-2 py-6">
      <h1 className="text-2xl font-bold mb-4 text-primary text-center">
        Find Open Tasks
      </h1>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-end bg-white border rounded-lg shadow p-3 mb-6">
        <div className="flex-1 w-full">
          <label className="text-xs font-medium mb-1 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs font-medium mb-1 block">Budget (min)</label>
          <Input
            type="number"
            value={budgetMin}
            min={0}
            inputMode="decimal"
            onChange={e => setBudgetMin(e.target.value)}
            className="text-sm"
            placeholder="€ Min"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs font-medium mb-1 block">Budget (max)</label>
          <Input
            type="number"
            value={budgetMax}
            min={0}
            inputMode="decimal"
            onChange={e => setBudgetMax(e.target.value)}
            className="text-sm"
            placeholder="€ Max"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs font-medium mb-1 block">Search</label>
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm"
            placeholder="Title or description..."
            onKeyDown={e => { if (e.key === "Enter") refetch(); }}
          />
        </div>
        <Button
          onClick={() => refetch()}
          className="mt-2 md:mt-0"
        >
          Search
        </Button>
      </div>
      {/* Loading state */}
      {isLoading && (
        <Card className="flex flex-col items-center py-16">
          <span className="text-primary">Loading tasks...</span>
        </Card>
      )}
      {/* Error state */}
      {error && (
        <Card className="flex flex-col items-center py-14">
          <div className="text-destructive">Error loading tasks. Please try again.</div>
        </Card>
      )}
      {/* Task list/cards */}
      <div className="grid gap-3">
        {tasks && tasks.length === 0 && !isLoading && (
          <Card className="flex flex-col items-center py-12">
            <span className="text-muted-foreground">No tasks found. Try adjusting your filters.</span>
          </Card>
        )}
        {tasks &&
          tasks.map((task: any) => {
            // Boost highlighting logic
            let boostStyle = "";
            let boostBadge = null;
            if (task.boost_status === "24h") {
              boostStyle = "border-2 border-yellow-400";
              boostBadge = (
                <Badge className="bg-yellow-400 text-yellow-900 flex items-center gap-1 px-2">
                  <Sparkles className="w-4 h-4" /> 24h Boosted
                </Badge>
              );
            } else if (task.boost_status === "8h") {
              boostStyle = "border-2 border-gray-400";
              boostBadge = (
                <Badge className="bg-gray-300 text-gray-800 flex items-center gap-1 px-2">
                  <Sparkles className="w-4 h-4" /> 8h Boosted
                </Badge>
              );
            }

            return (
              <Card
                key={task.id}
                className={cn(
                  "flex flex-col md:flex-row justify-between gap-3 p-4 relative items-start",
                  boostStyle
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">{task.offer}</span>
                    {boostBadge}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <BadgeEuro className="w-4 h-4" /> €{task.price}
                    </span>
                    <span>{task.category}</span>
                    {task.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {task.location}
                      </span>
                    )}
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatDeadline(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                <Button size="sm" className="self-end md:self-center">
                  View Details
                </Button>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
