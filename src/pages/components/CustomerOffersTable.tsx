
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { useOffers } from '@/hooks/useOffers';
import QueryWrapper from '@/components/QueryWrapper';
import TableSkeleton from '@/components/TableSkeleton';

export default function CustomerOffersTable() {
  const { data, isLoading, error, refetch } = useOffers();

  const loadingSkeleton = (
    <TableSkeleton 
      columns={6} 
      columnHeaders={['Task ID', 'Provider ID', 'Message', 'Price', 'Status', 'Created At']}
    />
  );

  const emptyState = (
    <div className="text-center py-6 text-muted-foreground">
      No offers found.{' '}
      <a 
        href="/offers" 
        className="underline text-primary hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Explore available offers"
      >
        Explore offers
      </a>
      .
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
        <h3 className="font-bold text-lg mb-1">Offers</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).slice(0, 6).map((o: any) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-caption">{o.task_id}</TableCell>
                <TableCell className="font-mono text-caption">{o.provider_id}</TableCell>
                <TableCell className="max-w-xs truncate" title={o.message}>{o.message}</TableCell>
                <TableCell>{o.price}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded text-caption font-medium ${
                      o.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      o.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                    aria-label={`Offer status: ${o.status}`}
                  >
                    {o.status}
                  </span>
                </TableCell>
                <TableCell>{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </QueryWrapper>
  );
}
