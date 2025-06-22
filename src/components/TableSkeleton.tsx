
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  columnHeaders?: string[];
}

export default function TableSkeleton({ columns, rows = 5, columnHeaders }: TableSkeletonProps) {
  return (
    <div className="rounded-xl bg-white/90 shadow p-4 overflow-x-auto">
      <Skeleton className="h-6 w-32 mb-4" />
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index}>
                {columnHeaders?.[index] ? (
                  columnHeaders[index]
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
