
import React, { useState } from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockTasks } from "@/mocks/mockTasks";
import { AlertCircle } from "lucide-react";

export default function AdminTaskOversight() {
  const [filter, setFilter] = useState<"all"|"active"|"flagged">("all");
  const tasks = filter === "all" ? mockTasks : mockTasks.filter(t => filter === "flagged" ? t.flagged : t.status === filter);

  const emptyStates: Record<string, {msg: string, icon?: React.ReactNode}> = {
    all: { msg: "No tasks available. Create a task to get started!", icon: <AlertCircle size={40} className="text-yellow-400" /> },
    active: { msg: "No active tasks. All caught up!" },
    flagged: { msg: "No flagged tasks presently. Good job!" }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 items-end">
        <label className="font-semibold">Filter by:</label>
        <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="border rounded px-2 py-1 bg-background">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
      <AdminTable
        emptyMessage={!tasks.length ? emptyStates[filter].msg : undefined}
        emptyIcon={!tasks.length ? emptyStates[filter].icon : undefined}
      >
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Poster</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map(task=>(
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.poster}</TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.category}</TableCell>
              <TableCell>{task.risk}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="destructive">Remove</Button>
                  <Button size="sm" variant="default">Edit</Button>
                  <Button size="sm" variant="secondary">Flag</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </div>
  );
}

