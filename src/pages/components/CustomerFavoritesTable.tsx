
import React from "react";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useFavorites } from "@/hooks/useFavorites";

export default function CustomerFavoritesTable() {
  const { data, isLoading, error } = useFavorites();
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto text-blue-400" />
        <span className="block mt-2 text-muted-foreground">Loading favorites...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center py-6">Failed to load favorites.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No favorites yet. Browse providers and click the heart to add favorites!
      </div>
    );
  }
  return (
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
              <TableCell>{f.customer_id}</TableCell>
              <TableCell>{f.provider_id}</TableCell>
              <TableCell>{f.created_at ? new Date(f.created_at).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
