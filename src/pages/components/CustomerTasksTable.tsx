
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { useUserTasks } from "@/hooks/useUserTasks";
import QueryWrapper from "@/components/QueryWrapper";
import TableSkeleton from "@/components/TableSkeleton";

export default function CustomerTasksTable() {
  const { data, isLoading, error, refetch } = useUserTasks();

  const loadingSkeleton = (
    <TableSkeleton 
      columns={5} 
      columnHeaders={['Title', 'Status', 'Category', 'Price', 'Deadline']}
    />
  );

  const emptyState = (
    <div className="text-center py-6 text-muted-foreground">
      No tasks found. Be the first to{' '}
      <a 
        href="/post-task" 
        className="underline text-primary hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Post a new task"
      >
        post a task
      </a>
      !
    </div>
  );

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      data={data}
      loadingSkeleton={loadingSkeleton}
      retryFn={refetch}
      emptyState={emptyState}
    >
      <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
        <h3 className="font-bold text-lg mb-1">My Tasks</h3>
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
            {(data ?? []).map((task: any) => (
              <TableRow key={task.id}>
                <TableCell>{task.offer || task.description}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    aria-label={`Task status: ${task.status}`}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>{task.category}</TableCell>
                <TableCell>€{task.price}</TableCell>
                <TableCell>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </QueryWrapper>
  );
}
