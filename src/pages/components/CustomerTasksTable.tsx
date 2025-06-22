
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table";
import { useTasks } from "@/hooks/useTasks";
import QueryWrapper from "@/components/QueryWrapper";
import TableSkeleton from "@/components/TableSkeleton";

export default function CustomerTasksTable() {
  const { data, isLoading, error, refetch } = useTasks();

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
            {(data ?? []).slice(0, 6).map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{t.offer || t.description}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded text-caption font-medium ${
                      t.status === 'completed' ? 'bg-green-100 text-green-800' :
                      t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    aria-label={`Task status: ${t.status}`}
                  >
                    {t.status}
                  </span>
                </TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>€{t.price}</TableCell>
                <TableCell>{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </QueryWrapper>
  );
}
