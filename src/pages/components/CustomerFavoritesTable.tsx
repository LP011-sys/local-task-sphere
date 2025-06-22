
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { useFavorites } from '@/hooks/useFavorites';
import QueryWrapper from '@/components/QueryWrapper';
import TableSkeleton from '@/components/TableSkeleton';

export default function CustomerFavoritesTable() {
  const { data, isLoading, error, refetch } = useFavorites();

  const loadingSkeleton = (
    <TableSkeleton 
      columns={3} 
      columnHeaders={['Customer ID', 'Provider ID', 'Created At']}
    />
  );

  const emptyState = (
    <div className="text-center py-6 text-muted-foreground">
      No favorites yet. Browse providers and click the heart to add favorites!
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
        <h3 className="font-bold text-lg mb-1">Favorites</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).slice(0, 6).map((f: any) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-caption">{f.customer_id}</TableCell>
                <TableCell className="font-mono text-caption">{f.provider_id}</TableCell>
                <TableCell>{f.created_at ? new Date(f.created_at).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </QueryWrapper>
  );
}
