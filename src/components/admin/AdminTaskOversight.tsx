
import React, { useState } from "react";
import { TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { AdminTable } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { mockTasks } from "@/mocks/mockTasks";
import { ClipboardList, ListTodo, AlertCircle, Eye, Trash2, Pencil, Flag } from "lucide-react";

export default function AdminTaskOversight() {
  const [filter, setFilter] = useState<"all"|"active"|"flagged">("all");
  const tasks = filter === "all" ? mockTasks : mockTasks.filter(t => filter === "flagged" ? t.flagged : t.status === filter);

  // Use task-related icons for empty states
  const emptyStates: Record<string, {msg: string, icon?: React.ReactNode}> = {
    all: { msg: "No tasks available. Create a task to get started!", icon: <ClipboardList size={40} className="text-yellow-400" /> },
    active: { msg: "No active tasks. All caught up!", icon: <ListTodo size={40} className="text-green-400" /> },
    flagged: { msg: "No flagged tasks presently. Good job!", icon: <AlertCircle size={40} className="text-blue-500" /> }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Task Oversight</h2>
      <p className="text-muted-foreground mb-4 text-sm">
        See all tasks, spot flagged or active tasks, and use quick actions to monitor the task feed.
      </p>
      <div className="mb-4 flex gap-2 items-end">
        <label className="font-semibold">Filter by:</label>
        <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="border rounded px-2 py-1 bg-background">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
      {/* Mobile scroll wrapper */}
      <div className="w-full overflow-x-auto">
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
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline"><Eye className="mr-1" size={16} /> View</Button>
                    <Button size="sm" variant="destructive"><Trash2 className="mr-1" size={16} /> Remove</Button>
                    <Button size="sm" variant="default"><Pencil className="mr-1" size={16} /> Edit</Button>
                    <Button size="sm" variant="secondary"><Flag className="mr-1" size={16} /> Flag</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminTable>
      </div>
    </div>
  );
}

