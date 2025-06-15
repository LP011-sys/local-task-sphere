
import React from "react";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useTasks } from "@/hooks/useTasks";

export default function CustomerTasksTable() {
  const { data, isLoading, error } = useTasks();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load tasks.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No tasks found. Be the first to <a href="/post-task" className="underline text-primary">post a task</a>!
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
      <h3 className="font-bold text-lg mb-1">Tasks</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).slice(0, 6).map((t:any) => (
            <TableRow key={t.id}>
              <TableCell>{t.offer || t.description}</TableCell>
              <TableCell>{t.status}</TableCell>
              <TableCell>{t.category}</TableCell>
              <TableCell>€{t.price}</TableCell>
              <TableCell>{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
