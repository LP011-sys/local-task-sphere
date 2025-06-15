
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function breakdownStatus(tasks: any[]) {
  const status = { open: 0, "in progress": 0, completed: 0 };
  for (const t of tasks) {
    if (t.status === "open") status.open++;
    else if (t.status === "in progress") status["in progress"]++;
    else if (t.status === "completed") status.completed++;
  }
  return status;
}

function breakdownBoost(tasks: any[]) {
  const b = { "8h": 0, "24h": 0 };
  for (const t of tasks) {
    if (t.boost_type === "8h") b["8h"]++;
    else if (t.boost_type === "24h") b["24h"]++;
  }
  return b;
}

export default function AdminTasksOverview() {
  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ["admin-all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Tasks")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  let status = { open: 0, "in progress": 0, completed: 0 }, boost = { "8h": 0, "24h": 0 };
  if (tasks && Array.isArray(tasks)) {
    status = breakdownStatus(tasks);
    boost = breakdownBoost(tasks);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tasks Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="text-center py-6"><div className="text-lg font-bold">{tasks?.length ?? "-"}</div><div>Total Tasks</div></Card>
        <Card className="text-center py-6"><div className="text-lg font-bold">{status.open}</div><div>Open</div></Card>
        <Card className="text-center py-6"><div className="text-lg font-bold">{status["in progress"]}</div><div>In Progress</div></Card>
        <Card className="text-center py-6"><div className="text-lg font-bold">{status.completed}</div><div>Completed</div></Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="text-center py-5"><div className="text-lg font-bold">{boost["8h"]}</div><div>8h Boosts</div></Card>
        <Card className="text-center py-5"><div className="text-lg font-bold">{boost["24h"]}</div><div>24h Boosts</div></Card>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" /> Loading tasks...
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-center py-10 text-red-400">
          Failed to load tasks.
        </div>
      )}
    </div>
  );
}
