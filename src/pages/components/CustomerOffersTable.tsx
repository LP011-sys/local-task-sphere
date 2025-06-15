
import React from "react";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useOffers } from "../Index";

export default function CustomerOffersTable() {
  const { data, isLoading, error } = useOffers();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading offers...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load offers.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No offers found. <a href="/offers" className="underline text-primary">Explore offers</a>.
      </div>
    );
  }
  return (
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
              <TableCell>{o.task_id}</TableCell>
              <TableCell>{o.provider_id}</TableCell>
              <TableCell>{o.message}</TableCell>
              <TableCell>{o.price}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell>{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
